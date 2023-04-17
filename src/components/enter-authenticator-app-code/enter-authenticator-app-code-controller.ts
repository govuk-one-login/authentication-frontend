import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import { ERROR_CODES, pathWithQueryParam } from "../common/constants";
import { supportAccountRecovery } from "../../config";
import { VerifyMfaCodeInterface } from "./types";
import { AccountRecoveryInterface } from "../common/account-recovery/types";
import { accountRecoveryService } from "../common/account-recovery/account-recovery-service";
import { BadRequestError } from "../../utils/error";
import { MFA_METHOD_TYPE, PATH_NAMES } from "../../app.constants";
import { verifyMfaCodeService } from "../common/verify-mfa-code/verify-mfa-code-service";
import { verifyMfaCodePost } from "../common/verify-mfa-code/verify-mfa-code-controller";

export const ENTER_AUTH_APP_CODE_DEFAULT_TEMPLATE_NAME =
  "enter-authenticator-app-code/index.njk";
export const UPLIFT_REQUIRED_AUTH_APP_TEMPLATE_NAME =
  "enter-authenticator-app-code/index-2fa-service-uplift-auth-app.njk";

export function enterAuthenticatorAppCodeGet(
  service: AccountRecoveryInterface = accountRecoveryService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { email, isUpliftRequired } = req.session.user;

    const templateName = isUpliftRequired
      ? UPLIFT_REQUIRED_AUTH_APP_TEMPLATE_NAME
      : ENTER_AUTH_APP_CODE_DEFAULT_TEMPLATE_NAME;

    if (
      req.session.user.wrongCodeEnteredLock &&
      new Date().toUTCString() < req.session.user.wrongCodeEnteredLock
    ) {
      return res.render(
        "security-code-error/index-security-code-entered-exceeded.njk",
        {
          newCodeLink: PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE,
          isAuthApp: true,
        }
      );
    }

    const isAccountRecoveryEnabledForEnvironment = supportAccountRecovery();

    if (!isAccountRecoveryEnabledForEnvironment) {
      return res.render(templateName, {
        isAccountRecoveryPermitted: false,
      });
    }

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

    const isAccountRecoveryPermittedForUser =
      (req.session.user.isAccountRecoveryPermitted =
        accountRecoveryResponse.data.accountRecoveryPermitted);

    const checkEmailLink = pathWithQueryParam(
      PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES,
      "type",
      MFA_METHOD_TYPE.AUTH_APP
    );

    return res.render(templateName, {
      isAccountRecoveryPermitted: isAccountRecoveryPermittedForUser,
      checkEmailLink,
    });
  };
}

export const enterAuthenticatorAppCodePost = (
  service: VerifyMfaCodeInterface = verifyMfaCodeService()
): ExpressRouteFunc => {
  return async function (req: Request, res: Response) {
    const { isUpliftRequired } = req.session.user;

    const template = isUpliftRequired
      ? UPLIFT_REQUIRED_AUTH_APP_TEMPLATE_NAME
      : ENTER_AUTH_APP_CODE_DEFAULT_TEMPLATE_NAME;

    const verifyMfaCodeRequest = verifyMfaCodePost(service, {
      methodType: MFA_METHOD_TYPE.AUTH_APP,
      registration: false,
      template: template,
      validationKey:
        "pages.enterAuthenticatorAppCode.code.validationError.invalidCode",
      validationErrorCode: ERROR_CODES.AUTH_APP_INVALID_CODE,
    });

    return verifyMfaCodeRequest(req, res);
  };
};
