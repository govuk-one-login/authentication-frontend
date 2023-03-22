import { Request, Response, NextFunction } from "express";
import { sendNotificationService } from "../common/send-notification/send-notification-service";
import { NOTIFICATION_TYPE } from "../../app.constants";
import { getErrorPathByCode } from "../common/constants";
import { BadRequestError } from "../../utils/error";
import xss from "xss";

export async function sendEmailOtp(
  req: Request,
  res: Response,
  next: NextFunction,
  notificationService = sendNotificationService()
): Promise<void> {
  const email = req.session.user.email.toLowerCase();
  const phoneNumber = req.session.user.phoneNumber;
  const { sessionId, clientSessionId, persistentSessionId } = res.locals;

  const sendNotificationResponse = await notificationService.sendNotification(
    sessionId,
    clientSessionId,
    email,
    NOTIFICATION_TYPE.VERIFY_CHANGE_HOW_GET_SECURITY_CODES,
    req.ip,
    persistentSessionId,
    xss(req.cookies.lng as string),
    phoneNumber,
    false
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
}
