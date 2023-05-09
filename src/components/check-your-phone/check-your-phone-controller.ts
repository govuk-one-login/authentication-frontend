import { Request, Response } from "express";
import { MFA_METHOD_TYPE, NOTIFICATION_TYPE } from "../../app.constants";
import { ExpressRouteFunc } from "../../types";
import {
  ERROR_CODES,
  getErrorPathByCode,
  getNextPathAndUpdateJourney,
} from "../common/constants";
import { SendNotificationServiceInterface } from "../common/send-notification/types";
import { sendNotificationService } from "../common/send-notification/send-notification-service";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";
import xss from "xss";
import { VerifyMfaCodeInterface } from "../enter-authenticator-app-code/types";
import {
  formatValidationError,
  renderBadRequest,
} from "../../utils/validation";
import { BadRequestError } from "../../utils/error";
import { verifyMfaCodeService } from "../common/verify-mfa-code/verify-mfa-code-service";

const TEMPLATE_NAME = "check-your-phone/index.njk";

export function checkYourPhoneGet(req: Request, res: Response): void {
  res.render(TEMPLATE_NAME, {
    phoneNumber: req.session.user.redactedPhoneNumber,
  });
}

export const checkYourPhonePost = (
  service: VerifyMfaCodeInterface = verifyMfaCodeService(),
  notificationService: SendNotificationServiceInterface = sendNotificationService()
): ExpressRouteFunc => {
  return async function (req: Request, res: Response) {
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;

    const result = await service.verifyMfaCode(
      MFA_METHOD_TYPE.SMS,
      req.body["code"],
      true,
      sessionId,
      clientSessionId,
      req.ip,
      persistentSessionId,
      req.session.user.phoneNumber
    );

    if (!result.success) {
      if (result.data.code === ERROR_CODES.INVALID_VERIFY_PHONE_NUMBER_CODE) {
        const error = formatValidationError(
          "code",
          req.t("pages.checkYourPhone.code.validationError.invalidCode")
        );
        return renderBadRequest(res, req, TEMPLATE_NAME, error);
      }

      const path = getErrorPathByCode(result.data.code);

      if (path) {
        return res.redirect(path);
      }

      throw new BadRequestError(result.data.message, result.data.code);
    }

    await notificationService.sendNotification(
      res.locals.sessionId,
      res.locals.clientSessionId,
      req.session.user.email,
      NOTIFICATION_TYPE.ACCOUNT_CREATED_CONFIRMATION,
      req.ip,
      res.locals.persistentSessionId,
      xss(req.cookies.lng as string)
    );

    return res.redirect(
      getNextPathAndUpdateJourney(
        req,
        req.path,
        USER_JOURNEY_EVENTS.PHONE_NUMBER_VERIFIED,
        {
          isIdentityRequired: req.session.user.isIdentityRequired,
        },
        res.locals.sessionId
      )
    );
  };
};