import { Request, Response } from "express";
import {
  HREF_BACK,
  MFA_METHOD_TYPE,
  NOTIFICATION_TYPE,
} from "../../../app.constants";
import { VerifyCodeInterface } from "../../common/verify-code/types";
import { codeService } from "../../common/verify-code/verify-code-service";
import { verifyCodePost } from "../../common/verify-code/verify-code-controller";
import { ExpressRouteFunc } from "../../../types";
import { ERROR_CODES } from "../../common/constants";
import { AccountInterventionsInterface } from "../../account-intervention/types";
import { accountInterventionService } from "../../account-intervention/account-intervention-service";

const TEMPLATE_NAME =
  "account-recovery/check-your-email-security-codes/index.njk";

export function checkYourEmailSecurityCodesGet(
  req: Request,
  res: Response
): void {
  let backUrl = "";
  if (req.query.type === MFA_METHOD_TYPE.AUTH_APP) {
    backUrl = HREF_BACK.ENTER_AUTHENTICATOR_APP_CODE;
  } else if (req.query.type === MFA_METHOD_TYPE.SMS) {
    backUrl = HREF_BACK.ENTER_MFA;
  }
  res.render(TEMPLATE_NAME, {
    email: req.session.user.email,
    backUrl: backUrl,
  });
}

export const checkYourEmailSecurityCodesPost = (
  service: VerifyCodeInterface = codeService(),
  accountInterventionsService: AccountInterventionsInterface = accountInterventionService()
): ExpressRouteFunc => {
  return verifyCodePost(service, accountInterventionsService, {
    notificationType: NOTIFICATION_TYPE.VERIFY_CHANGE_HOW_GET_SECURITY_CODES,
    template: TEMPLATE_NAME,
    validationKey:
      "pages.checkYourEmailSecurityCodes.code.validationError.invalidCode",
    validationErrorCode: ERROR_CODES.INVALID_VERIFY_EMAIL_CODE,
  });
};
