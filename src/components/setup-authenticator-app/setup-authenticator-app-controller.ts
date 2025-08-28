import type { Request, Response } from "express";
import QRCode from "qrcode";
import type { ExpressRouteFunc } from "../../types.js";
import { ERROR_CODES } from "../common/constants.js";
import { getNextPathAndUpdateJourney } from "../common/state-machine/state-machine-executor.js";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine.js";
import {
  generateQRCodeValue,
  removeDefaultSmsMfaMethod,
} from "../../utils/mfa.js";
import { BadRequestError } from "../../utils/error.js";
import { splitSecretKeyIntoFragments } from "../../utils/strings.js";
import {
  formatValidationError,
  renderBadRequest,
} from "../../utils/validation.js";
import type { SendNotificationServiceInterface } from "../common/send-notification/types.js";
import { sendNotificationService } from "../common/send-notification/send-notification-service.js";
import {
  JOURNEY_TYPE,
  MFA_METHOD_TYPE,
  NOTIFICATION_TYPE,
} from "../../app.constants.js";
import xss from "xss";
import type { VerifyMfaCodeInterface } from "../enter-authenticator-app-code/types.js";
import { verifyMfaCodeService } from "../common/verify-mfa-code/verify-mfa-code-service.js";
import { getJourneyTypeFromUserSession } from "../common/journey/journey.js";
import {
  isAccountRecoveryJourney,
  isAccountRecoveryJourneyAndPermitted,
} from "../../utils/request.js";

const TEMPLATE = "setup-authenticator-app/index.njk";

export async function setupAuthenticatorAppGet(
  req: Request,
  res: Response
): Promise<void> {
  const qrCodeText = generateQRCodeValue(
    req.session.user.authAppSecret,
    req.session.user.email,
    req.t("general.authenticatorAppIssuer")
  );

  req.session.user.authAppQrCodeUrl = await QRCode.toDataURL(qrCodeText);
  req.session.user.isAccountCreationJourney = !isAccountRecoveryJourney(req);

  res.render(TEMPLATE, {
    qrCode: req.session.user.authAppQrCodeUrl,
    secretKeyFragmentArray: splitSecretKeyIntoFragments(
      req.session.user.authAppSecret
    ),
  });
}

export function setupAuthenticatorAppPost(
  service: VerifyMfaCodeInterface = verifyMfaCodeService(),
  notificationService: SendNotificationServiceInterface = sendNotificationService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { authAppSecret } = req.session.user;
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;
    const code = req.body.code;

    const journeyType = getJourneyTypeFromUserSession(req.session.user, {
      includeAccountRecovery: true,
      fallbackJourneyType: JOURNEY_TYPE.REGISTRATION,
    });

    const verifyAccessCodeRes = await service.verifyMfaCode(
      MFA_METHOD_TYPE.AUTH_APP,
      code,
      sessionId,
      clientSessionId,
      persistentSessionId,
      req,
      journeyType,
      authAppSecret
    );

    if (!verifyAccessCodeRes.success) {
      if (verifyAccessCodeRes.data.code === ERROR_CODES.AUTH_APP_INVALID_CODE) {
        const error = formatValidationError(
          "code",
          req.t("pages.setupAuthenticatorApp.code.validationError.invalidCode")
        );
        return renderBadRequest(res, req, TEMPLATE, error, {
          qrCode: req.session.user.authAppQrCodeUrl,
          secretKeyFragmentArray: splitSecretKeyIntoFragments(
            req.session.user.authAppSecret
          ),
        });
      }

      throw new BadRequestError(
        verifyAccessCodeRes.data.message,
        verifyAccessCodeRes.data.code
      );
    }

    req.session.user.authAppSecret = null;
    req.session.user.mfaMethods = removeDefaultSmsMfaMethod(
      req.session.user.mfaMethods
    );

    let notificationType = NOTIFICATION_TYPE.ACCOUNT_CREATED_CONFIRMATION;

    if (isAccountRecoveryJourneyAndPermitted(req)) {
      req.session.user.accountRecoveryVerifiedMfaType =
        MFA_METHOD_TYPE.AUTH_APP;
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
        res,
        USER_JOURNEY_EVENTS.MFA_CODE_VERIFIED
      )
    );
  };
}
