import { Request, Response } from "express";
import { NOTIFICATION_TYPE, SERVICE_TYPE } from "../../app.constants";
import { ExpressRouteFunc } from "../../types";
import { SendNotificationServiceInterface } from "../common/send-notification/types";
import { sendNotificationService } from "../common/send-notification/send-notification-service";
import { BadRequestError } from "../../utils/error";
import { getNextPathByState } from "../common/constants";

export function accountNotFoundGet(req: Request, res: Response): void {
  if (req.session.serviceType === SERVICE_TYPE.OPTIONAL) {
    res.render("account-not-found/index-optional.njk");
  } else {
    res.render("account-not-found/index-mandatory.njk", {
      email: req.session.email,
    });
  }
}

export function accountNotFoundPost(
  service: SendNotificationServiceInterface = sendNotificationService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const email = req.session.email;
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;

    const result = await service.sendNotification(
      sessionId,
      clientSessionId,
      email,
      NOTIFICATION_TYPE.VERIFY_EMAIL,
      req.ip,
      persistentSessionId
    );

    if (!result.success && !result.sessionState) {
      throw new BadRequestError(result.message, result.code);
    }

    res.redirect(getNextPathByState(result.sessionState));
  };
}
