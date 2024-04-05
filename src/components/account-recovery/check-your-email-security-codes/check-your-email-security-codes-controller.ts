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

const oplValues = {
  createAccount: {
    contentId: "95e26313-bc2f-49bc-bc62-fd715476c1d9",
    taxonomyLevel2: "create account",
  },
  accountRecovery: {
    contentId: "account recovery",
    taxonomyLevel2: "e768e27b-1c4d-48ba-8bcf-4c40274a6441",
  },
};

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

  const { isAccountRecoveryJourney } = req.session.user;

  res.render(TEMPLATE_NAME, {
    email: req.session.user.email,
    backUrl: backUrl,
    contentId: isAccountRecoveryJourney
      ? oplValues.accountRecovery.contentId
      : oplValues.createAccount.contentId,
    taxonomyLevel2: isAccountRecoveryJourney
      ? oplValues.accountRecovery.taxonomyLevel2
      : oplValues.createAccount.taxonomyLevel2,
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
