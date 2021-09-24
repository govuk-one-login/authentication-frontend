import { Request, Response } from "express";
import { NOTIFICATION_TYPE, PATH_NAMES, USER_STATE } from "../../app.constants";
import { VerifyCodeInterface } from "../common/verify-code/types";
import { codeService } from "../common/verify-code/verify-code-service";
import { verifyCodePost } from "../common/verify-code/verify-code-controller";
import { ExpressRouteFunc } from "../../types";

const TEMPLATE_NAME = "enter-mfa/index.njk";

export function enterMfaGet(req: Request, res: Response): void {
  res.render(TEMPLATE_NAME, {
    phoneNumber: req.session.user.phoneNumber,
  });
}

export const enterMfaPost = (
  service: VerifyCodeInterface = codeService()
): ExpressRouteFunc => {
  return verifyCodePost(service, {
    notificationType: NOTIFICATION_TYPE.MFA_SMS,
    template: TEMPLATE_NAME,
    successPath: PATH_NAMES.AUTH_CODE,
    validationKey: "pages.enterMfa.code.validationError.invalidCode",
    validationState: USER_STATE.MFA_CODE_NOT_VALID,
  });
};
