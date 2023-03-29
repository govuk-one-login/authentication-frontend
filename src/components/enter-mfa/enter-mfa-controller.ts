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

const TEMPLATE_NAME = "enter-mfa/index.njk";

export function enterMfaGet(
  service: AccountRecoveryInterface = accountRecoveryService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const isAccountRecoveryEnabledForEnvironment = supportAccountRecovery();

    if (!isAccountRecoveryEnabledForEnvironment) {
      return res.render(TEMPLATE_NAME, {
        phoneNumber: req.session.user.phoneNumber,
        isAuthApp: req.session.user.mfaMethodType === MFA_METHOD_TYPE.AUTH_APP,
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

    res.render(TEMPLATE_NAME, {
      phoneNumber: req.session.user.phoneNumber,
      isAuthApp: req.session.user.mfaMethodType === MFA_METHOD_TYPE.AUTH_APP,
      supportAccountRecovery: isAccountRecoveryEnabledForEnvironment,
      checkEmailLink,
    });
  };
}

export const enterMfaPost = (
  service: VerifyCodeInterface = codeService()
): ExpressRouteFunc => {
  return verifyCodePost(service, {
    notificationType: NOTIFICATION_TYPE.MFA_SMS,
    template: TEMPLATE_NAME,
    validationKey: "pages.enterMfa.code.validationError.invalidCode",
    validationErrorCode: ERROR_CODES.INVALID_MFA_CODE,
  });
};
