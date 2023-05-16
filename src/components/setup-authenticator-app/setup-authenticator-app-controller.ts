import { Request, Response } from "express";
import QRCode from "qrcode";
import { ExpressRouteFunc } from "../../types";
import { ERROR_CODES, getNextPathAndUpdateJourney } from "../common/constants";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";
import { generateQRCodeValue } from "../../utils/mfa";
import { BadRequestError } from "../../utils/error";
import { splitSecretKeyIntoFragments } from "../../utils/strings";
import {
  formatValidationError,
  renderBadRequest,
} from "../../utils/validation";
import { SendNotificationServiceInterface } from "../common/send-notification/types";
import { sendNotificationService } from "../common/send-notification/send-notification-service";
import {
  JOURNEY_TYPE,
  MFA_METHOD_TYPE,
  NOTIFICATION_TYPE,
} from "../../app.constants";
import xss from "xss";
import { VerifyMfaCodeInterface } from "../enter-authenticator-app-code/types";
import { verifyMfaCodeService } from "../common/verify-mfa-code/verify-mfa-code-service";

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
    const {
      authAppSecret,
      isAccountRecoveryJourney,
      isAccountRecoveryPermitted,
    } = req.session.user;
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;
    const code = req.body.code;

    const journeyType =
      isAccountRecoveryPermitted && isAccountRecoveryJourney
        ? JOURNEY_TYPE.ACCOUNT_RECOVERY
        : JOURNEY_TYPE.REGISTRATION;

    const verifyAccessCodeRes = await service.verifyMfaCode(
      MFA_METHOD_TYPE.AUTH_APP,
      code,
      sessionId,
      clientSessionId,
      req.ip,
      persistentSessionId,
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
          secretKey: req.session.user.authAppSecret,
        });
      }

      throw new BadRequestError(
        verifyAccessCodeRes.data.message,
        verifyAccessCodeRes.data.code
      );
    }

    req.session.user.authAppSecret = null;

    const notificationType =
      isAccountRecoveryPermitted && isAccountRecoveryJourney
        ? NOTIFICATION_TYPE.CHANGE_HOW_GET_SECURITY_CODES_CONFIRMATION
        : NOTIFICATION_TYPE.ACCOUNT_CREATED_CONFIRMATION;

    await notificationService.sendNotification(
      res.locals.sessionId,
      res.locals.clientSessionId,
      req.session.user.email,
      notificationType,
      req.ip,
      res.locals.persistentSessionId,
      xss(req.cookies.lng as string)
    );

    return res.redirect(
      getNextPathAndUpdateJourney(
        req,
        req.path,
        USER_JOURNEY_EVENTS.MFA_CODE_VERIFIED,
        {
          isIdentityRequired: req.session.user.isIdentityRequired,
        },
        sessionId
      )
    );
  };
}
