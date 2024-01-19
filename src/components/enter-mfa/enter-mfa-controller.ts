import { Request, Response } from "express";
import {
  NOTIFICATION_TYPE,
  PATH_NAMES,
  MFA_METHOD_TYPE,
} from "../../app.constants";
import { VerifyCodeInterface } from "../common/verify-code/types";
import { codeService } from "../common/verify-code/verify-code-service";
import { verifyCodePost } from "../common/verify-code/verify-code-controller";
import { ExpressRouteFunc } from "../../types";
import { ERROR_CODES, pathWithQueryParam } from "../common/constants";
import { supportAccountRecovery } from "../../config";
import { AccountRecoveryInterface } from "../common/account-recovery/types";
import { accountRecoveryService } from "../common/account-recovery/account-recovery-service";
import { BadRequestError } from "../../utils/error";
import { getJourneyTypeFromUserSession } from "../common/journey/journey";

export const ENTER_MFA_DEFAULT_TEMPLATE_NAME = "enter-mfa/index.njk";
export const UPLIFT_REQUIRED_SMS_TEMPLATE_NAME =
  "enter-mfa/index-2fa-service-uplift-mobile-phone.njk";

export function enterMfaGet(
  service: AccountRecoveryInterface = accountRecoveryService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const isAccountRecoveryEnabledForEnvironment = supportAccountRecovery();

    const templateName = req.session.user.isUpliftRequired
      ? UPLIFT_REQUIRED_SMS_TEMPLATE_NAME
      : ENTER_MFA_DEFAULT_TEMPLATE_NAME;

    if (!isAccountRecoveryEnabledForEnvironment) {
      return res.render(templateName, {
        phoneNumber: req.session.user.redactedPhoneNumber,
        supportAccountRecovery: false,
      });
    }

    const { email } = req.session.user;
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;

    const accountRecoveryResponse = await service.accountRecovery(
      sessionId,
      clientSessionId,
      email,
      req.ip,
      persistentSessionId
    );

    if (!accountRecoveryResponse.success) {
      throw new BadRequestError(
        accountRecoveryResponse.data.message,
        accountRecoveryResponse.data.code
      );
    }

    req.session.user.isAccountRecoveryPermitted =
      accountRecoveryResponse.data.accountRecoveryPermitted;

    const checkEmailLink = pathWithQueryParam(
      PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES,
      "type",
      MFA_METHOD_TYPE.SMS
    );

    res.render(templateName, {
      phoneNumber: req.session.user.redactedPhoneNumber,
      supportAccountRecovery: req.session.user.isAccountRecoveryPermitted,
      checkEmailLink,
    });
  };
}

export const enterMfaPost = (
  service: VerifyCodeInterface = codeService()
): ExpressRouteFunc => {
  return async function (req: Request, res: Response) {
    const { isUpliftRequired } = req.session.user;

    const template = isUpliftRequired
      ? UPLIFT_REQUIRED_SMS_TEMPLATE_NAME
      : ENTER_MFA_DEFAULT_TEMPLATE_NAME;

    const verifyCodeRequest = verifyCodePost(service, {
      notificationType: NOTIFICATION_TYPE.MFA_SMS,
      template: template,
      validationKey: "pages.enterMfa.code.validationError.invalidCode",
      validationErrorCode: ERROR_CODES.INVALID_MFA_CODE,
      journeyType: getJourneyTypeFromUserSession(req.session.user, {
        includeReauthentication: true,
      }),
    });

    return verifyCodeRequest(req, res);
  };
};
