import { NextFunction, Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import { getNotificationService } from "../../services/service-injection";
import { NotificationServiceInterface } from "../../services/notification-service.interface";
import { NOTIFICATION_TYPE, PATH_NAMES } from "../../app.constants";
import {
  formatValidationError,
  renderBadRequest,
} from "../../utils/validation";

const TEMPLATE_NAME = "verify-email/index.njk";

export function verifyEmailGet(req: Request, res: Response): void {
  res.render(TEMPLATE_NAME, {
    email: req.session.user.email,
  });
}

export function verifyEmailPost(
  notificationService: NotificationServiceInterface = getNotificationService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const code = req.body["code"];
      const sessionId = req.session.user.id;

      const isValidCode = await notificationService.verifyCode(
        sessionId,
        code,
        NOTIFICATION_TYPE.VERIFY_EMAIL
      );

      if (isValidCode) {
        return res.redirect(PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD);
      }

      const error = formatValidationError(
        "code",
        req.t("pages.verifyEmail.code.validationError.invalidCode")
      );

      renderBadRequest(res, req, TEMPLATE_NAME, error);
    } catch (error) {
      next(error);
    }
  };
}
