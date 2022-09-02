import { Request, Response } from "express";
import { NOTIFICATION_TYPE } from "../../app.constants";
import { ExpressRouteFunc } from "../../types";
import { enterEmailService } from "./enter-email-service";
import { EnterEmailServiceInterface } from "./types";
import {
  getErrorPathByCode,
  getNextPathAndUpdateJourney,
} from "../common/constants";
import { BadRequestError } from "../../utils/error";
import { SendNotificationServiceInterface } from "../common/send-notification/types";
import { sendNotificationService } from "../common/send-notification/send-notification-service";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";
import xss from "xss";

export function enterEmailGet(req: Request, res: Response): void {
  return res.render("enter-email/index-existing-account.njk");
}

export function enterEmailCreateGet(req: Request, res: Response): void {
  return res.render("enter-email/index-create-account.njk");
}

export function enterEmailPost(
  service: EnterEmailServiceInterface = enterEmailService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const email = req.body.email;
    const sessionId = res.locals.sessionId;
    req.session.user.email = email.toLowerCase();

    const result = await service.userExists(
      sessionId,
      email,
      req.ip,
      res.locals.persistentSessionId
    );

    if (!result.success) {
      throw new BadRequestError(result.data.message, result.data.code);
    }

    const nextState = result.data.doesUserExist
      ? USER_JOURNEY_EVENTS.VALIDATE_CREDENTIALS
      : USER_JOURNEY_EVENTS.ACCOUNT_NOT_FOUND;

    return res.redirect(
      getNextPathAndUpdateJourney(req, req.path, nextState, null, sessionId)
    );
  };
}

export function enterEmailCreatePost(
  service: EnterEmailServiceInterface = enterEmailService(),
  notificationService: SendNotificationServiceInterface = sendNotificationService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const email = req.body.email.toLowerCase();
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;

    req.session.user.email = email;

    const userExistsResponse = await service.userExists(
      sessionId,
      email,
      req.ip,
      persistentSessionId
    );

    if (!userExistsResponse.success) {
      throw new BadRequestError(
        userExistsResponse.data.message,
        userExistsResponse.data.code
      );
    }

    if (userExistsResponse.data.doesUserExist) {
      return res.redirect(
        getNextPathAndUpdateJourney(
          req,
          req.path,
          USER_JOURNEY_EVENTS.ACCOUNT_FOUND_CREATE,
          null,
          sessionId
        )
      );
    }

    const sendNotificationResponse = await notificationService.sendNotification(
      sessionId,
      clientSessionId,
      email,
      NOTIFICATION_TYPE.VERIFY_EMAIL,
      req.ip,
      persistentSessionId,
      xss(req.cookies.lng as string)
    );

    if (!sendNotificationResponse.success) {
      const path = getErrorPathByCode(sendNotificationResponse.data.code);

      if (path) {
        return res.redirect(path);
      }

      throw new BadRequestError(
        sendNotificationResponse.data.message,
        sendNotificationResponse.data.code
      );
    }

    return res.redirect(
      getNextPathAndUpdateJourney(
        req,
        req.path,
        USER_JOURNEY_EVENTS.SEND_EMAIL_CODE,
        null,
        sessionId
      )
    );
  };
}
