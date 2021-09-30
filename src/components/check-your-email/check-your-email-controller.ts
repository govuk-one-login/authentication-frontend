import { Request, Response } from "express";
import { NOTIFICATION_TYPE, USER_STATE } from "../../app.constants";
import { VerifyCodeInterface } from "../common/verify-code/types";
import { codeService } from "../common/verify-code/verify-code-service";
import { verifyCodePost } from "../common/verify-code/verify-code-controller";
import { ExpressRouteFunc } from "../../types";

const TEMPLATE_NAME = "check-your-email/index.njk";

export function checkYourEmailGet(req: Request, res: Response): void {
  res.render(TEMPLATE_NAME, {
    email: req.session.user.email,
  });
}

export const checkYourEmailPost = (
  service: VerifyCodeInterface = codeService()
): ExpressRouteFunc => {
  return verifyCodePost(service, {
    notificationType: NOTIFICATION_TYPE.VERIFY_EMAIL,
    template: TEMPLATE_NAME,
    validationKey: "pages.checkYourEmail.code.validationError.invalidCode",
    validationState: USER_STATE.EMAIL_CODE_NOT_VALID,
  });
};
