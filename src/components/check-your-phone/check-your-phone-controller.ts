import type { Request, Response } from "express";
import {
  JOURNEY_TYPE,
  MFA_METHOD_TYPE,
  NOTIFICATION_TYPE,
  PATH_NAMES,
} from "../../app.constants.js";
import type { ExpressRouteFunc } from "../../types.js";
import {
  ERROR_CODES,
  getErrorPathByCode,
  getNextPathAndUpdateJourney,
  pathWithQueryParam,
} from "../common/constants.js";
import type { SendNotificationServiceInterface } from "../common/send-notification/types.js";
import { sendNotificationService } from "../common/send-notification/send-notification-service.js";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine.js";
import xss from "xss";
import type { VerifyMfaCodeInterface } from "../enter-authenticator-app-code/types.js";
import {
  formatValidationError,
  renderBadRequest,
} from "../../utils/validation.js";
import { BadRequestError } from "../../utils/error.js";
import { verifyMfaCodeService } from "../common/verify-mfa-code/verify-mfa-code-service.js";
import { getJourneyTypeFromUserSession } from "../common/journey/journey.js";
import { isLocked } from "../../utils/lock-helper.js";
import { isAccountRecoveryJourneyAndPermitted } from "../../utils/request.js";
import { getDefaultSmsMfaMethod } from "../../utils/mfa.js";

const TEMPLATE_NAME = "check-your-phone/index.njk";
const RESEND_CODE_LINK = pathWithQueryParam(
  PATH_NAMES.RESEND_MFA_CODE_ACCOUNT_CREATION,
  "isResendCodeRequest",
  "true"
);

export function checkYourPhoneGet(req: Request, res: Response): void {
  if (isLocked(req.session.user.codeRequestLock)) {
    return res.render("security-code-error/index-wait.njk", {
      newCodeLink: RESEND_CODE_LINK,
      isAccountCreationJourney: req.session.user.isAccountCreationJourney,
    });
  }
  return res.render(TEMPLATE_NAME, {
    phoneNumber: getDefaultSmsMfaMethod(req.session.user.mfaMethods)
      ?.redactedPhoneNumber,
    resendCodeLink: RESEND_CODE_LINK,
  });
}

export const checkYourPhonePost = (
  service: VerifyMfaCodeInterface = verifyMfaCodeService(),
  notificationService: SendNotificationServiceInterface = sendNotificationService()
): ExpressRouteFunc => {
  return async function (req: Request, res: Response) {
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;

    const journeyType = getJourneyTypeFromUserSession(req.session.user, {
      includeAccountRecovery: true,
      fallbackJourneyType: JOURNEY_TYPE.REGISTRATION,
    });

    const result = await service.verifyMfaCode(
      MFA_METHOD_TYPE.SMS,
      req.body["code"],
      sessionId,
      clientSessionId,
      persistentSessionId,
      req,
      journeyType,
      getDefaultSmsMfaMethod(req.session.user.mfaMethods)?.phoneNumber
    );

    if (!result.success) {
      if (result.data.code === ERROR_CODES.INVALID_VERIFY_PHONE_NUMBER_CODE) {
        const error = formatValidationError(
          "code",
          req.t("pages.checkYourPhone.code.validationError.invalidCode")
        );
        return renderBadRequest(res, req, TEMPLATE_NAME, error, {
          resendCodeLink: RESEND_CODE_LINK,
        });
      }

      const path = getErrorPathByCode(result.data.code);

      if (path) {
        return res.redirect(path);
      }

      throw new BadRequestError(result.data.message, result.data.code);
    }

    const accountRecoveryEnabledJourney =
      isAccountRecoveryJourneyAndPermitted(req);

    let notificationType = NOTIFICATION_TYPE.ACCOUNT_CREATED_CONFIRMATION;

    if (accountRecoveryEnabledJourney) {
      req.session.user.accountRecoveryVerifiedMfaType = MFA_METHOD_TYPE.SMS;
      notificationType =
        NOTIFICATION_TYPE.CHANGE_HOW_GET_SECURITY_CODES_CONFIRMATION;
    }

    await notificationService.sendNotification(
      res.locals.sessionId,
      res.locals.clientSessionId,
      req.session.user.email,
      notificationType,
      res.locals.persistentSessionId,
      xss(req.cookies.lng as string),
      req,
      journeyType
    );

    return res.redirect(
      await getNextPathAndUpdateJourney(
        req,
        req.path,
        USER_JOURNEY_EVENTS.PHONE_NUMBER_VERIFIED,
        {
          isIdentityRequired: req.session.user.isIdentityRequired,
          isAccountRecoveryJourney: accountRecoveryEnabledJourney,
        },
        res.locals.sessionId
      )
    );
  };
};
