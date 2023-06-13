import { Request, Response, NextFunction } from "express";
import { sendNotificationService } from "../../common/send-notification/send-notification-service";
import { JOURNEY_TYPE, NOTIFICATION_TYPE } from "../../../app.constants";
import { getErrorPathByCode } from "../../common/constants";
import { BadRequestError } from "../../../utils/error";
import xss from "xss";
import { ExpressRouteFunc } from "../../../types";

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
      req.ip,
      persistentSessionId,
      xss(req.cookies.lng as string),
      JOURNEY_TYPE.ACCOUNT_RECOVERY
    );

    if (sendNotificationResponse.success) {
      return next();
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
