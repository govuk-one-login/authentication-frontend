import { Request, Response } from "express";
import {
  JOURNEY_TYPE,
  NOTIFICATION_TYPE,
  WEB_TO_MOBILE_TEMPLATE_MAPPINGS,
} from "../../app.constants";
import { ExpressRouteFunc } from "../../types";
import { SendNotificationServiceInterface } from "../common/send-notification/types";
import { sendNotificationService } from "../common/send-notification/send-notification-service";
import { BadRequestError } from "../../utils/error";
import {
  getErrorPathByCode,
  getNextPathAndUpdateJourney,
} from "../common/constants";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";
import xss from "xss";
import { getServiceSignInLink } from "../../config";
import { getChannelSpecificTemplate } from "../../utils/get-channel-specific-template";
import { getAccountNotFoundWebTemplate } from "./get-account-not-found-web-template";

export function accountNotFoundGet(req: Request, res: Response): void {
  const webTemplate: string = getAccountNotFoundWebTemplate(
    req.session.client.isOneLoginService,
    req.session.client.serviceType
  );
  const channelTemplate = getChannelSpecificTemplate(
    webTemplate,
    res.locals.strategicAppChannel,
    WEB_TO_MOBILE_TEMPLATE_MAPPINGS
  );

  res.render(channelTemplate, {
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
        req.path,
        USER_JOURNEY_EVENTS.SEND_EMAIL_CODE,
        null,
        sessionId
      )
    );
  };
}
