import type { Request, Response } from "express";
import type { ExpressRouteFunc } from "../../types.js";
import { JOURNEY_TYPE, NOTIFICATION_TYPE } from "../../app.constants.js";
import { getErrorPathByCode } from "../common/constants.js";
import { getNextPathAndUpdateJourney } from "../common/state-machine/state-machine-executor.js";
import { BadRequestError } from "../../utils/error.js";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine.js";
import type { SendNotificationServiceInterface } from "../common/send-notification/types.js";
import { sendNotificationService } from "../common/send-notification/send-notification-service.js";
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

    const journeyType = JOURNEY_TYPE.REGISTRATION;

    const sendNotificationResponse = await notificationService.sendNotification(
      sessionId,
      clientSessionId,
      email,
      NOTIFICATION_TYPE.VERIFY_EMAIL,
      persistentSessionId,
      xss(req.cookies.lng as string),
      req,
      journeyType,
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

    if (
      req.session.user.isAccountCreationJourney &&
      req.session.user?.isVerifyEmailCodeResendRequired
    ) {
      delete req.session.user.isVerifyEmailCodeResendRequired;
    }

    return res.redirect(
      await getNextPathAndUpdateJourney(
        req,
        res,
        USER_JOURNEY_EVENTS.SEND_EMAIL_CODE
      )
    );
  };
}
