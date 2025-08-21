import type { Request, Response } from "express";
import { JOURNEY_TYPE, NOTIFICATION_TYPE } from "../../app.constants.js";
import type { ExpressRouteFunc } from "../../types.js";
import type { SendNotificationServiceInterface } from "../common/send-notification/types.js";
import { sendNotificationService } from "../common/send-notification/send-notification-service.js";
import { BadRequestError } from "../../utils/error.js";
import {
  getErrorPathByCode,
} from "../common/constants.js";
import { getNextPathAndUpdateJourney } from "../common/state-machine/state-machine-executor.js";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine.js";
import xss from "xss";
import { getServiceSignInLink } from "../../config.js";
import { getAccountNotFoundTemplate } from "./get-account-not-found-template.js";
import { clientIsOneLogin } from "../../utils/request.js";
export function accountNotFoundGet(req: Request, res: Response): void {
  const template: string = getAccountNotFoundTemplate(
    clientIsOneLogin(req),
    req.session.client.serviceType,
    res.locals.isApp
  );

  res.render(template, {
    email: req.session.user.email,
  });
}

export function accountNotFoundPost(
  service: SendNotificationServiceInterface = sendNotificationService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    if (req.body.optionSelected === "sign-in-to-a-service") {
      return res.redirect(getServiceSignInLink());
    }

    const { sessionId, clientSessionId, persistentSessionId } = res.locals;

    const result = await service.sendNotification(
      sessionId,
      clientSessionId,
      req.session.user.email,
      NOTIFICATION_TYPE.VERIFY_EMAIL,
      persistentSessionId,
      xss(req.cookies.lng as string),
      req,
      JOURNEY_TYPE.REGISTRATION
    );

    if (!result.success) {
      const path = getErrorPathByCode(result.data.code);

      if (path) {
        return res.redirect(path);
      }

      throw new BadRequestError(result.data.message, result.data.code);
    }

    req.session.user.isAccountCreationJourney = true;

    res.redirect(
      await getNextPathAndUpdateJourney(
        req,
        res,
        USER_JOURNEY_EVENTS.SEND_EMAIL_CODE,
      )
    );
  };
}
