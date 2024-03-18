import xss from "xss";
import { Request, Response } from "express";

import { ExpressRouteFunc } from "../../../types";
import {
  JOURNEY_TYPE,
  NOTIFICATION_TYPE,
  PATH_NAMES,
} from "../../../app.constants";
import {
  ERROR_CODES,
  getErrorPathByCode,
  pathWithQueryParam,
} from "../../common/constants";
import { SendNotificationServiceInterface } from "../../common/send-notification/types";
import { sendNotificationService } from "../../common/send-notification/send-notification-service";
import { BadRequestError } from "../../../utils/error";
import {
  getCodeRequestBlockDurationInMinutes,
  support2hrLockout,
} from "../../../config";

export function resendMfaCodeGet(req: Request, res: Response): void {
  res.render("account-creation/resend-mfa-code/index.njk", {
    phoneNumber: req.session.user.redactedPhoneNumber,
    isResendCodeRequest: req.query?.isResendCodeRequest,
    support2hrLockout: support2hrLockout(),
  });
}

export const resendMfaCodePost = (
  service: SendNotificationServiceInterface = sendNotificationService()
): ExpressRouteFunc => {
  return async function (req: Request, res: Response) {
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
