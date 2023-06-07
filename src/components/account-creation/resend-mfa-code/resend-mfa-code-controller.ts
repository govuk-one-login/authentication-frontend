import xss from "xss";
import { Request, Response } from "express";

import { ExpressRouteFunc } from "../../../types";
import {
  JOURNEY_TYPE,
  NOTIFICATION_TYPE,
  PATH_NAMES,
} from "../../../app.constants";
import { getErrorPathByCode, pathWithQueryParam } from "../../common/constants";
import { SendNotificationServiceInterface } from "../../common/send-notification/types";
import { sendNotificationService } from "../../common/send-notification/send-notification-service";
import { BadRequestError } from "../../../utils/error";

export function resendMfaCodeGet(req: Request, res: Response): void {
  const newCodeLink = req.query?.isResendCodeRequest
    ? pathWithQueryParam(
        PATH_NAMES.RESEND_MFA_CODE_ACCOUNT_CREATION,
        "isResendCodeRequest",
        "true"
      )
    : PATH_NAMES.RESEND_MFA_CODE_ACCOUNT_CREATION;

  if (
    req.session.user.wrongCodeEnteredLock &&
    new Date().getTime() <
      new Date(req.session.user.wrongCodeEnteredLock).getTime()
  ) {
    res.render("security-code-error/index-security-code-entered-exceeded.njk", {
      newCodeLink: newCodeLink,
      isAuthApp: false,
    });
  } else if (
    req.session.user.codeRequestLock &&
    new Date().getTime() < new Date(req.session.user.codeRequestLock).getTime()
  ) {
    res.render("security-code-error/index-wait.njk", {
      newCodeLink,
    });
  } else {
    res.render("account-creation/resend-mfa-code/index.njk", {
      phoneNumber: req.session.user.redactedPhoneNumber,
      isResendCodeRequest: req.query?.isResendCodeRequest,
    });
  }
}

export const resendMfaCodePost = (
  service: SendNotificationServiceInterface = sendNotificationService()
): ExpressRouteFunc => {
  return async function (req: Request, res: Response) {
    console.log("LKJDHLAKJSHAKLJSH - the post is being hit");
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;
    const { email, phoneNumber } = req.session.user;

    const sendNotificationResponse = await service.sendNotification(
      sessionId,
      clientSessionId,
      email,
      NOTIFICATION_TYPE.VERIFY_PHONE_NUMBER,
      req.ip,
      persistentSessionId,
      xss(req.cookies.lng as string),
      JOURNEY_TYPE.REGISTRATION,
      phoneNumber
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

    return res.redirect(PATH_NAMES.CHECK_YOUR_PHONE);
  };
};
