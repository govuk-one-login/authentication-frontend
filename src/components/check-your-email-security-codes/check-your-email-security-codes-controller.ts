import { Request, Response } from "express";
import { NOTIFICATION_TYPE } from "../../app.constants";
import { VerifyCodeInterface } from "../common/verify-code/types";
import { codeService } from "../common/verify-code/verify-code-service";
import { verifyCodePost } from "../common/verify-code/verify-code-controller";
import { ExpressRouteFunc } from "../../types";
import { ERROR_CODES } from "../common/constants";

const TEMPLATE_NAME = "check-your-email-security-codes/index.njk";

export function checkYourEmailSecurityCodesGet(
  req: Request,
  res: Response
): void {
  res.render(TEMPLATE_NAME, {
    email: req.session.user.email,
  });
}

export const checkYourEmailSecurityCodesPost = (
  service: VerifyCodeInterface = codeService()
): ExpressRouteFunc => {
  return verifyCodePost(service, {
    notificationType: NOTIFICATION_TYPE.VERIFY_CHANGE_HOW_GET_SECURITY_CODES,
    template: TEMPLATE_NAME,
    validationKey:
      "pages.checkYourEmailSecurityCodes.code.validationError.invalidCode",
    validationErrorCode: ERROR_CODES.INVALID_VERIFY_EMAIL_CODE,
  });
};
