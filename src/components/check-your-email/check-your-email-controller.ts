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
import { supportCheckEmailFraud } from "../../config";
import { isLocked } from "../../utils/lock-helper";
import { logger } from "../../utils/logger";
import { CheckEmailFraudBlockInterface } from "../check-email-fraud-block/types";
import { checkEmailFraudBlockService } from "../check-email-fraud-block/check-email-fraud-block-service";

const TEMPLATE_NAME = "check-your-email/index.njk";

export function checkYourEmailGet(req: Request, res: Response): void {
  req.session.user.isAccountCreationJourney = true;
  if (isLocked(req.session.user.codeRequestLock)) {
    return res.render("security-code-error/index-wait.njk", {
      newCodeLink: getNewCodePath(
        req.query.actionType as SecurityCodeErrorType
      ),
      isAccountCreationJourney: true,
      isStrategicAppJourney: res.locals.strategicAppChannel === true,
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
