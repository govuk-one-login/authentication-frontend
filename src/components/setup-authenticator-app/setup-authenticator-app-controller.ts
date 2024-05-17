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
import { getJourneyTypeFromUserSession } from "../common/journey/journey";

const TEMPLATE = "setup-authenticator-app/index.njk";

const oplValues = {
  createAccount: {
    contentId: "5bc82db9-2012-44bf-9a7d-34d1d22fb035",
    taxonomyLevel2: "create account",
  },
  accountRecovery: {
    contentId: "124051ef-673a-4eda-b585-96d9d711f545",
    taxonomyLevel2: "account recovery",
  },
};

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
  req.session.user.isAccountCreationJourney =
    !req.session.user.isAccountRecoveryJourney;

  const isAccountRecoveryJourney = req.session.user.isAccountRecoveryJourney;

  res.render(TEMPLATE, {
    qrCode: req.session.user.authAppQrCodeUrl,
    secretKeyFragmentArray: splitSecretKeyIntoFragments(
      req.session.user.authAppSecret
    ),
    contentId: isAccountRecoveryJourney
      ? oplValues.accountRecovery.contentId
      : oplValues.createAccount.contentId,
    taxonomyLevel2: isAccountRecoveryJourney
      ? oplValues.accountRecovery.taxonomyLevel2
      : oplValues.createAccount.taxonomyLevel2,
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

    const journeyType = getJourneyTypeFromUserSession(req.session.user, {
      includeAccountRecovery: true,
      fallbackJourneyType: JOURNEY_TYPE.REGISTRATION,
    });

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
    req.session.user.phoneNumber = null;
    req.session.user.redactedPhoneNumber = null;

    const accountRecoveryEnabledJourney =
      isAccountRecoveryPermitted && isAccountRecoveryJourney;

    let notificationType = NOTIFICATION_TYPE.ACCOUNT_CREATED_CONFIRMATION;

    if (accountRecoveryEnabledJourney) {
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
      req.ip,
      res.locals.persistentSessionId,
      xss(req.cookies.lng as string),
      journeyType
    );

    return res.redirect(
      await getNextPathAndUpdateJourney(
        req,
        req.path,
        USER_JOURNEY_EVENTS.MFA_CODE_VERIFIED,
        {
          isIdentityRequired: req.session.user.isIdentityRequired,
          isAccountRecoveryJourney: accountRecoveryEnabledJourney,
        },
        sessionId
      )
    );
  };
}
