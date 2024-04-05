import { Request, Response } from "express";
import { NOTIFICATION_TYPE } from "../../app.constants";
import { VerifyCodeInterface } from "../common/verify-code/types";
import { codeService } from "../common/verify-code/verify-code-service";
import { verifyCodePost } from "../common/verify-code/verify-code-controller";
import { ExpressRouteFunc } from "../../types";
import { ERROR_CODES, SecurityCodeErrorType } from "../common/constants";
import { AccountInterventionsInterface } from "../account-intervention/types";
import { accountInterventionService } from "../account-intervention/account-intervention-service";
import { getNewCodePath } from "../security-code-error/security-code-error-controller";
import { support2hrLockout } from "../../config";
import { isLocked } from "../../utils/lock-helper";

const TEMPLATE_NAME = "check-your-email/index.njk";

const oplValues = {
  createAccount: {
    contentId: "054e1ea8-97a8-461a-a964-07345c80098e",
    taxonomyLevel2: "create account",
  },
  accountRecoveryPassword: {
    contentId: "653c3488-2436-489a-83df-eef29cbf2f7b",
    taxonomyLevel2: "account recovery",
  },
  accountRecovery2fa: {
    contentId: "8c9cfa1a-fde2-42e0-b785-16f0a06896e2",
    taxonomyLevel2: "account recovery",
  },
  accountIntervention: {
    contentId: "7b663466-8001-436f-b10b-e6ac581d39aa",
    taxonomyLevel2: "account intervention",
  },
};

export function checkYourEmailGet(req: Request, res: Response): void {
  if (isLocked(req.session.user.codeRequestLock)) {
    return res.render("security-code-error/index-wait.njk", {
      newCodeLink: getNewCodePath(
        req.query.actionType as SecurityCodeErrorType
      ),
      support2hrLockout: support2hrLockout(),
      isAccountCreationJourney: true,
    });
  }
  res.render(TEMPLATE_NAME, {
    email: req.session.user.email,
    contentId: oplValues.createAccount.contentId,
    taxonomyLevel2: oplValues.createAccount.taxonomyLevel2,
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
