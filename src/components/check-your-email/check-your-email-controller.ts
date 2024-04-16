import { Request, Response } from "express";
import { NOTIFICATION_TYPE } from "../../app.constants";
import { VerifyCodeInterface } from "../common/verify-code/types";
import { codeService } from "../common/verify-code/verify-code-service";
import { verifyCodePost } from "../common/verify-code/verify-code-controller";
import { ExpressRouteFunc } from "../../types";
import {
  ERROR_CODES,
  SecurityCodeErrorType,
  getErrorPathByCode,
} from "../common/constants";
import { AccountInterventionsInterface } from "../account-intervention/types";
import { accountInterventionService } from "../account-intervention/account-intervention-service";
import { getNewCodePath } from "../security-code-error/security-code-error-controller";
import { support2hrLockout } from "../../config";
import { isLocked } from "../../utils/lock-helper";

const TEMPLATE_NAME = "check-your-email/index.njk";

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
  });
}

export const checkYourEmailPost = (
  service: VerifyCodeInterface = codeService(),
  accountInterventionsService: AccountInterventionsInterface = accountInterventionService()
): ExpressRouteFunc => {
  return async function (req: Request, res: Response) {
    if (req.session.user?.isVerifyEmailCodeResendRequired) {
      const path = getErrorPathByCode(
        ERROR_CODES.ENTERED_INVALID_VERIFY_EMAIL_CODE_MAX_TIMES
      );
      return res.redirect(path);
    }
    const verifyCodeRequest = verifyCodePost(
      service,
      accountInterventionsService,
      {
        notificationType: NOTIFICATION_TYPE.VERIFY_EMAIL,
        template: TEMPLATE_NAME,
        validationKey: "pages.checkYourEmail.code.validationError.invalidCode",
        validationErrorCode: ERROR_CODES.INVALID_VERIFY_EMAIL_CODE,
      }
    );
    return verifyCodeRequest(req, res);
  };
};
