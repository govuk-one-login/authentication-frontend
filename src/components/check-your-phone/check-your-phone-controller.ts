import { Request, Response } from "express";
import { NOTIFICATION_TYPE, PATH_NAMES, USER_STATE } from "../../app.constants";
import { VerifyCodeInterface } from "../common/verify-code/types";
import { codeService } from "../common/verify-code/verify-code-service";
import { verifyCodePost } from "../common/verify-code/verify-code-controller";
import { ExpressRouteFunc } from "../../types";

const TEMPLATE_NAME = "check-your-phone/index.njk";

export function checkYourPhoneGet(req: Request, res: Response): void {
  res.render(TEMPLATE_NAME, {
    phoneNumber: req.session.user.phoneNumber,
  });
}

export const checkYourPhonePost = (
  service: VerifyCodeInterface = codeService()
): ExpressRouteFunc => {
  return verifyCodePost(service, {
    notificationType: NOTIFICATION_TYPE.VERIFY_PHONE_NUMBER,
    template: TEMPLATE_NAME,
    successPath: PATH_NAMES.CREATE_ACCOUNT_SUCCESSFUL,
    validationKey: "pages.checkYourPhone.code.validationError.invalidCode",
    validationState: USER_STATE.PHONE_NUMBER_CODE_NOT_VALID,
  });
};
