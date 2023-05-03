import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import { NOTIFICATION_TYPE, PATH_NAMES } from "../../app.constants";
import {
  getErrorPathByCode,
  getNextPathAndUpdateJourney,
} from "../common/constants";
import { BadRequestError } from "../../utils/error";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";
import { SendNotificationServiceInterface } from "../common/send-notification/types";
import { sendNotificationService } from "../common/send-notification/send-notification-service";
import xss from "xss";

export function resendEmailCodeGet(req: Request, res: Response): void {
  res.render("resend-email-code/index.njk", {
    emailAddress: req.session.user.email,
    requestNewCode:
      req.query.requestNewCode && req.query.requestNewCode === "true",
  });
}

export function resendEmailCodePost(
  notificationService: SendNotificationServiceInterface = sendNotificationService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const email = req.session.user.email.toLowerCase();
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;
    const isAccountRecoveryJourney = req.session.user?.isAccountRecoveryJourney;

    const sendNotificationResponse = await notificationService.sendNotification(
      sessionId,
      clientSessionId,
      email,
      getNotificationTemplateType(isAccountRecoveryJourney),
      req.ip,
      persistentSessionId,
      xss(req.cookies.lng as string),
      undefined,
      xss(req.body.requestNewCode as string) === "true"
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

    if (isAccountRecoveryJourney) {
      req.session.user.isAccountRecoveryCodeResent = true;
    }

    return res.redirect(
      getNextPathAndUpdateJourney(
        req,
        req.path,
        USER_JOURNEY_EVENTS.SEND_EMAIL_CODE,
        {
          isAccountRecoveryJourney: isAccountRecoveryJourney,
        },
        sessionId
      )
    );
  };
}

export function securityCodeCheckTimeLimit(
  notificationService: SendNotificationServiceInterface = sendNotificationService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const email = req.session.user.email.toLowerCase();
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;
    const isAccountRecoveryJourney = req.session.user?.isAccountRecoveryJourney;

    const sendNotificationResponse = await notificationService.sendNotification(
      sessionId,
      clientSessionId,
      email,
      getNotificationTemplateType(isAccountRecoveryJourney),
      req.ip,
      persistentSessionId,
      xss(req.cookies.lng as string),
      undefined,
      xss(req.body.requestNewCode as string) === "true"
    );

    if (!sendNotificationResponse.success) {
      return res.render("security-code-error/index-wait.njk", {
        newCodeLink: PATH_NAMES.SECURITY_CODE_CHECK_TIME_LIMIT,
      });
    }

    if (isAccountRecoveryJourney) {
      req.session.user.isAccountRecoveryCodeResent = true;
    }

    return res.redirect(
      getNextPathAndUpdateJourney(
        req,
        req.path,
        USER_JOURNEY_EVENTS.SEND_EMAIL_CODE,
        {
          isAccountRecoveryJourney: isAccountRecoveryJourney,
        },
        sessionId
      )
    );
  };
}

function getNotificationTemplateType(
  isAccountRecoveryJourney: boolean
): NOTIFICATION_TYPE {
  if (isAccountRecoveryJourney) {
    return NOTIFICATION_TYPE.VERIFY_CHANGE_HOW_GET_SECURITY_CODES;
  } else {
    return NOTIFICATION_TYPE.VERIFY_EMAIL;
  }
}
