import { NOTIFICATION_TYPE } from "../../app.constants";
import { codeService } from "../common/verify-code/verify-code-service";
import { verifyCodePost } from "../common/verify-code/verify-code-controller";
import { ERROR_CODES, getErrorPathByCode, } from "../common/constants";
import { accountInterventionService } from "../account-intervention/account-intervention-service";
import { getNewCodePath } from "../security-code-error/security-code-error-controller";
import { supportCheckEmailFraud } from "../../config";
import { isLocked } from "../../utils/lock-helper";
import { logger } from "../../utils/logger";
import { checkEmailFraudBlockService } from "../check-email-fraud-block/check-email-fraud-block-service";
const TEMPLATE_NAME = "check-your-email/index.njk";
export function checkYourEmailGet(req, res) {
    req.session.user.isAccountCreationJourney = true;
    if (isLocked(req.session.user.codeRequestLock)) {
        return res.render("security-code-error/index-wait.njk", {
            newCodeLink: getNewCodePath(req.query.actionType),
            isAccountCreationJourney: true,
        });
    }
    res.render(TEMPLATE_NAME, {
        email: req.session.user.email,
    });
}
export const checkYourEmailPost = (service = codeService(), accountInterventionsService = accountInterventionService(), checkEmailFraudService = checkEmailFraudBlockService()) => {
    return async function (req, res) {
        if (req.session.user?.isVerifyEmailCodeResendRequired) {
            const path = getErrorPathByCode(ERROR_CODES.ENTERED_INVALID_VERIFY_EMAIL_CODE_MAX_TIMES);
            return res.redirect(path);
        }
        if (supportCheckEmailFraud()) {
            const { sessionId, clientSessionId, persistentSessionId } = res.locals;
            try {
                const checkEmailFraudResponse = await checkEmailFraudService.checkEmailFraudBlock(req.session.user.email, sessionId, clientSessionId, persistentSessionId, req);
                logger.info(`checkEmailFraudResponse: ${checkEmailFraudResponse.data.isBlockedStatus}`);
            }
            catch (e) {
                logger.error("Error checking email fraud block", e);
            }
        }
        const verifyCodeRequest = verifyCodePost(service, accountInterventionsService, {
            notificationType: NOTIFICATION_TYPE.VERIFY_EMAIL,
            template: TEMPLATE_NAME,
            validationKey: "pages.checkYourEmail.code.validationError.invalidCode",
            validationErrorCode: ERROR_CODES.INVALID_VERIFY_EMAIL_CODE,
        });
        return verifyCodeRequest(req, res);
    };
};
