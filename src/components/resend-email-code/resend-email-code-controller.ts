import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import { JOURNEY_TYPE, NOTIFICATION_TYPE } from "../../app.constants";
import {
  getErrorPathByCode,
  getNextPathAndUpdateJourney,
} from "../common/constants";
import { BadRequestError } from "../../utils/error";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";
import { SendNotificationServiceInterface } from "../common/send-notification/types";
import { sendNotificationService } from "../common/send-notification/send-notification-service";
import xss from "xss";
import { isLocked } from "../../utils/lock-helper";
import { isAccountRecoveryJourney } from "../../utils/request";

export function resendEmailCodeGet(req: Request, res: Response): void {
  if (
    isLocked(req.session.user.wrongCodeEnteredAccountRecoveryLock) ||
    isLocked(req.session.user.wrongCodeEnteredPasswordResetLock)
  ) {
    const newCodeLink = req.query?.isResendCodeRequest
      ? "/security-code-check-time-limit?isResendCodeRequest=true"
      : "/security-code-check-time-limit";

    let show2HrScreen = false;
    if (
      req.session.user.isPasswordResetJourney ||
      isAccountRecoveryJourney(req)
    ) {
      show2HrScreen = true;
    }

    return res.render(
      "security-code-error/index-security-code-entered-exceeded.njk",
      {
        newCodeLink,
        show2HrScreen: show2HrScreen,
      }
    );
  }

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
    const accountRecoveryJourney = isAccountRecoveryJourney(req);

    const journeyType = accountRecoveryJourney
      ? JOURNEY_TYPE.ACCOUNT_RECOVERY
      : JOURNEY_TYPE.REGISTRATION;

    const sendNotificationResponse = await notificationService.sendNotification(
      sessionId,
      clientSessionId,
      email,
      accountRecoveryJourney
        ? NOTIFICATION_TYPE.VERIFY_CHANGE_HOW_GET_SECURITY_CODES
        : NOTIFICATION_TYPE.VERIFY_EMAIL,
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

    if (accountRecoveryJourney) {
      req.session.user.isAccountRecoveryCodeResent = true;
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
        req.path,
        USER_JOURNEY_EVENTS.SEND_EMAIL_CODE,
        {
          isAccountRecoveryJourney: accountRecoveryJourney,
        },
        sessionId
      )
    );
  };
}

export function securityCodeCheckTimeLimit(): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { sessionId } = res.locals;
    const accountRecoveryJourney = isAccountRecoveryJourney(req);
    if (isLocked(req.session.user.codeRequestLock)) {
      const newCodeLink = req.query?.isResendCodeRequest
        ? "/security-code-check-time-limit?isResendCodeRequest=true"
        : "/security-code-check-time-limit";
      return res.render("security-code-error/index-wait.njk", {
        newCodeLink,
      });
    }

    if (accountRecoveryJourney) {
      req.session.user.isAccountRecoveryCodeResent = true;
    }

    return res.redirect(
      await getNextPathAndUpdateJourney(
        req,
        req.path,
        USER_JOURNEY_EVENTS.SEND_EMAIL_CODE,
        {
          isAccountRecoveryJourney: accountRecoveryJourney,
        },
        sessionId
      )
    );
  };
}
