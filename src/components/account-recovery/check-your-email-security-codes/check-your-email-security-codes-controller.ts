import type { Request, Response } from "express";
import {
  HREF_BACK,
  MFA_METHOD_TYPE,
  NOTIFICATION_TYPE,
} from "../../../app.constants.js";
import type { VerifyCodeInterface } from "../../common/verify-code/types.js";
import { codeService } from "../../common/verify-code/verify-code-service.js";
import { verifyCodePost } from "../../common/verify-code/verify-code-controller.js";
import type { ExpressRouteFunc } from "../../../types.js";
import { ERROR_CODES } from "../../common/constants.js";
import type { AccountInterventionsInterface } from "../../account-intervention/types.js";
import { accountInterventionService } from "../../account-intervention/account-intervention-service.js";
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
