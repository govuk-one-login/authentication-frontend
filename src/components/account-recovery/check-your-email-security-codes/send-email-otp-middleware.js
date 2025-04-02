import { sendNotificationService } from "../../common/send-notification/send-notification-service";
import { JOURNEY_TYPE, NOTIFICATION_TYPE, PATH_NAMES, } from "../../../app.constants";
import { ERROR_CODES, getErrorPathByCode } from "../../common/constants";
import { BadRequestError } from "../../../utils/error";
import xss from "xss";
export function sendEmailOtp(notificationService = sendNotificationService()) {
    return async function (req, res, next) {
        const email = req.session.user.email.toLowerCase();
        const { sessionId, clientSessionId, persistentSessionId } = res.locals;
        if (req.session.user?.isAccountRecoveryCodeResent) {
            req.session.user.isAccountRecoveryCodeResent = false;
            return next();
        }
        const sendNotificationResponse = await notificationService.sendNotification(sessionId, clientSessionId, email, NOTIFICATION_TYPE.VERIFY_CHANGE_HOW_GET_SECURITY_CODES, persistentSessionId, xss(req.cookies.lng), req, JOURNEY_TYPE.ACCOUNT_RECOVERY);
        if (sendNotificationResponse.success) {
            return next();
        }
        if (sendNotificationResponse.data?.code ===
            ERROR_CODES.VERIFY_CHANGE_HOW_GET_SECURITY_CODES_CODE_REQUEST_BLOCKED) {
            return res.render("security-code-error/index-wait.njk");
        }
        if (sendNotificationResponse.data?.code ===
            ERROR_CODES.VERIFY_CHANGE_HOW_GET_SECURITY_CODES_INVALID_CODE) {
            return res.render("security-code-error/index-security-code-entered-exceeded.njk", {
                newCodeLink: PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES,
                show2HrScreen: true,
            });
        }
        const path = sendNotificationResponse.data?.code
            ? getErrorPathByCode(sendNotificationResponse.data.code)
            : undefined;
        if (path) {
            return res.redirect(path);
        }
        throw new BadRequestError(sendNotificationResponse.data.message, sendNotificationResponse.data.code);
    };
}
