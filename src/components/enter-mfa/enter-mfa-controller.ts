import { Request, Response } from "express";
import {MFA_METHOD_TYPE, NOTIFICATION_TYPE} from "../../app.constants";
import { VerifyCodeInterface } from "../common/verify-code/types";
import { codeService } from "../common/verify-code/verify-code-service";
import { verifyCodePost } from "../common/verify-code/verify-code-controller";
import { ExpressRouteFunc } from "../../types";
import { ERROR_CODES } from "../common/constants";

const TEMPLATE_NAME = "enter-mfa/index.njk";

export function enterMfaGet(req: Request, res: Response): void {
  res.render(TEMPLATE_NAME, {
    phoneNumber: req.session.user.phoneNumber,
    isAuthApp: req.session.user.mfaMethodType === MFA_METHOD_TYPE.AUTH_APP
  });
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
