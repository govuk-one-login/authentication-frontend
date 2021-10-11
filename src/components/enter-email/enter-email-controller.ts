import { Request, Response } from "express";
import { NOTIFICATION_TYPE, USER_STATE } from "../../app.constants";
import { ExpressRouteFunc } from "../../types";
import { enterEmailService } from "./enter-email-service";
import { EnterEmailServiceInterface } from "./types";
import { getNextPathByState } from "../common/constants";
import { BadRequestError } from "../../utils/error";
import { SendNotificationServiceInterface } from "../common/send-notification/types";
import { sendNotificationService } from "../common/send-notification/send-notification-service";

export function enterEmailGet(req: Request, res: Response): void {
  if (req.session.createAccount) {
    return res.render("enter-email/index-create-account.njk");
  }
  return res.render("enter-email/index-existing-account.njk");
}

export function enterEmailPost(
  service: EnterEmailServiceInterface = enterEmailService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const email = req.body.email;
    const sessionId = res.locals.sessionId;
    req.session.email = email;

    const result = await service.userExists(sessionId, email, req.ip);

    if (!result.success) {
      throw new BadRequestError(result.message, result.code);
    }

    req.session.createAccount =
      result.sessionState === USER_STATE.USER_NOT_FOUND;

    return res.redirect(getNextPathByState(result.sessionState));
  };
}

export function enterEmailCreatePost(
  service: EnterEmailServiceInterface = enterEmailService(),
  notificationService: SendNotificationServiceInterface = sendNotificationService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const email = req.body.email;
    const sessionId = res.locals.sessionId;
    const clientSessionId = res.locals.clientSessionId;

    req.session.email = email;
    const userExistsResponse = await service.userExists(
      sessionId,
      email,
      req.ip
    );

    if (
      userExistsResponse.success &&
      userExistsResponse.sessionState === USER_STATE.AUTHENTICATION_REQUIRED
    ) {
      return res.redirect(
        getNextPathByState(USER_STATE.AUTHENTICATION_REQUIRED_ACCOUNT_EXISTS)
      );
    }

    const sendNotificationResponse = await notificationService.sendNotification(
      sessionId,
      clientSessionId,
      email,
      NOTIFICATION_TYPE.VERIFY_EMAIL,
      req.ip
    );

    if (!sendNotificationResponse.success && sendNotificationResponse.code) {
      throw new BadRequestError(
        sendNotificationResponse.message,
        sendNotificationResponse.code
      );
    }

    return res.redirect(
      getNextPathByState(sendNotificationResponse.sessionState)
    );
  };
}
