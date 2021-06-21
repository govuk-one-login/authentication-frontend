import { NextFunction, Request, Response } from "express";
import { AuthenticationServiceInterface } from "../../services/authentication-service.interface";
import { NOTIFICATION_TYPE, PATH_NAMES } from "../../app.constants";
import {
  getNotificationService,
  getUserService,
} from "../../services/service-injection";
import { NotificationServiceInterface } from "../../services/notification-service.interface";
import { ExpressRouteFunc } from "../../types";

export function enterEmailGet(req: Request, res: Response): void {
  res.render("enter-email/index.njk");
}

export function enterEmailPost(
  userService: AuthenticationServiceInterface = getUserService(),
  notificationService: NotificationServiceInterface = getNotificationService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const email = req.body["email"];

      const sessionId = req.session.user.id;

      req.session.user.email = email;

      if (await userService.userExists(sessionId, email)) {
        return res.redirect(PATH_NAMES.ENTER_PASSWORD);
      }

      await notificationService.sendNotification(
        sessionId,
        email,
        NOTIFICATION_TYPE.VERIFY_EMAIL
      );

      return res.redirect(PATH_NAMES.CHECK_YOUR_EMAIL);
    } catch (error) {
      next(error);
    }
  };
}
