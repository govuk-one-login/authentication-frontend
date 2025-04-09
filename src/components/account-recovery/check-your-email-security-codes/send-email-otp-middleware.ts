import { Request, Response, NextFunction } from "express";
import { sendNotificationService } from "../../common/send-notification/send-notification-service.js";
import {
  JOURNEY_TYPE,
  NOTIFICATION_TYPE,
  PATH_NAMES,
} from "../../../app.constants.js";
import { ERROR_CODES, getErrorPathByCode } from "../../common/constants.js";
import { BadRequestError } from "../../../utils/error.js";
import xss from "xss";
import { ExpressRouteFunc } from "../../../types.js";
export function sendEmailOtp(
  notificationService = sendNotificationService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response, next: NextFunction) {
    const email = req.session.user.email.toLowerCase();
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;

    if (req.session.user?.isAccountRecoveryCodeResent) {
      req.session.user.isAccountRecoveryCodeResent = false;
      return next();
    }

    const sendNotificationResponse = await notificationService.sendNotification(
      sessionId,
      clientSessionId,
      email,
      NOTIFICATION_TYPE.VERIFY_CHANGE_HOW_GET_SECURITY_CODES,
      persistentSessionId,
      xss(req.cookies.lng as string),
      req,
      JOURNEY_TYPE.ACCOUNT_RECOVERY
    );

    if (sendNotificationResponse.success) {
      return next();
    }

    if (
      sendNotificationResponse.data?.code ===
      ERROR_CODES.VERIFY_CHANGE_HOW_GET_SECURITY_CODES_CODE_REQUEST_BLOCKED
    ) {
      return res.render("security-code-error/index-wait.njk");
    }
    if (
      sendNotificationResponse.data?.code ===
      ERROR_CODES.VERIFY_CHANGE_HOW_GET_SECURITY_CODES_INVALID_CODE
    ) {
      return res.render(
        "security-code-error/index-security-code-entered-exceeded.njk",
        {
          newCodeLink: PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES,
          show2HrScreen: true,
        }
      );
    }

    const path = sendNotificationResponse.data?.code
      ? getErrorPathByCode(sendNotificationResponse.data.code)
      : undefined;

    if (path) {
      return res.redirect(path);
    }

    throw new BadRequestError(
      sendNotificationResponse.data.message,
      sendNotificationResponse.data.code
    );
  };
}
