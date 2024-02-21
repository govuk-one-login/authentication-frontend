import { Request, Response } from "express";
import { NOTIFICATION_TYPE } from "../../app.constants";
import { VerifyCodeInterface } from "../common/verify-code/types";
import { codeService } from "../common/verify-code/verify-code-service";
import { verifyCodePost } from "../common/verify-code/verify-code-controller";
import { ExpressRouteFunc } from "../../types";
import { ERROR_CODES } from "../common/constants";
import { AccountInterventionsInterface } from "../account-intervention/types";
import { accountInterventionService } from "../account-intervention/account-intervention-service";

const TEMPLATE_NAME = "check-your-email/index.njk";

export function checkYourEmailGet(req: Request, res: Response): void {
  res.render(TEMPLATE_NAME, {
    email: req.session.user.email,
  });
}

export const checkYourEmailPost = (
  service: VerifyCodeInterface = codeService(),
  accountInterventionsService: AccountInterventionsInterface = accountInterventionService()
): ExpressRouteFunc => {
  return verifyCodePost(service, accountInterventionsService, {
    notificationType: NOTIFICATION_TYPE.VERIFY_EMAIL,
    template: TEMPLATE_NAME,
    validationKey: "pages.checkYourEmail.code.validationError.invalidCode",
    validationErrorCode: ERROR_CODES.INVALID_VERIFY_EMAIL_CODE,
  });
};
