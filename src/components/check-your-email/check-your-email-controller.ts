import type { Request, Response } from "express";
import { NOTIFICATION_TYPE } from "../../app.constants.js";
import type { VerifyCodeInterface } from "../common/verify-code/types.js";
import { codeService } from "../common/verify-code/verify-code-service.js";
import { verifyCodePost } from "../common/verify-code/verify-code-controller.js";
import type { ExpressRouteFunc } from "../../types.js";
import type { SecurityCodeErrorType } from "../common/constants.js";
import { ERROR_CODES, getErrorPathByCode } from "../common/constants.js";
import type { AccountInterventionsInterface } from "../account-intervention/types.js";
import { accountInterventionService } from "../account-intervention/account-intervention-service.js";
import { getNewCodePath } from "../security-code-error/security-code-error-controller.js";
import { supportCheckEmailFraud } from "../../config.js";
import { isLocked } from "../../utils/lock-helper.js";
import { logger } from "../../utils/logger.js";
import type { CheckEmailFraudBlockInterface } from "../check-email-fraud-block/types.js";
import { checkEmailFraudBlockService } from "../check-email-fraud-block/check-email-fraud-block-service.js";
const TEMPLATE_NAME = "check-your-email/index.njk";

export function checkYourEmailGet(req: Request, res: Response): void {
  req.session.user.isAccountCreationJourney = true;
  if (isLocked(req.session.user.codeRequestLock)) {
    return res.render("security-code-error/index-wait.njk", {
      newCodeLink: getNewCodePath(
        req.query.actionType as SecurityCodeErrorType
      ),
      isAccountCreationJourney: true,
    });
  }
  res.render(TEMPLATE_NAME, {
    email: req.session.user.email,
  });
}

export const checkYourEmailPost = (
  service: VerifyCodeInterface = codeService(),
  accountInterventionsService: AccountInterventionsInterface = accountInterventionService(),
  checkEmailFraudService: CheckEmailFraudBlockInterface = checkEmailFraudBlockService()
): ExpressRouteFunc => {
  return async function (req: Request, res: Response) {
    if (req.session.user?.isVerifyEmailCodeResendRequired) {
      const path = getErrorPathByCode(
        ERROR_CODES.ENTERED_INVALID_VERIFY_EMAIL_CODE_MAX_TIMES
      );
      return res.redirect(path);
    }
    if (supportCheckEmailFraud()) {
      const { sessionId, clientSessionId, persistentSessionId } = res.locals;
      try {
        const checkEmailFraudResponse =
          await checkEmailFraudService.checkEmailFraudBlock(
            req.session.user.email,
            sessionId,
            clientSessionId,
            persistentSessionId,
            req
          );
        logger.info(
          `checkEmailFraudResponse: ${checkEmailFraudResponse.data.isBlockedStatus}`
        );
      } catch (e) {
        logger.error("Error checking email fraud block", e);
      }
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
