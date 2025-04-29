import xss from "xss";
import type { Request, Response } from "express";

import type { ExpressRouteFunc } from "../../../types.js";
import {
  JOURNEY_TYPE,
  NOTIFICATION_TYPE,
  PATH_NAMES,
} from "../../../app.constants.js";
import {
  getErrorPathByCode,
  pathWithQueryParam,
} from "../../common/constants.js";
import type { SendNotificationServiceInterface } from "../../common/send-notification/types.js";
import { sendNotificationService } from "../../common/send-notification/send-notification-service.js";
import { BadRequestError } from "../../../utils/error.js";
import { isLocked } from "../../../utils/lock-helper.js";
import { isAccountRecoveryJourney } from "../../../utils/request.js";
import { getDefaultSmsMfaMethod } from "../../../utils/mfa.js";

export function resendMfaCodeGet(req: Request, res: Response): void {
  const newCodeLink = req.query?.isResendCodeRequest
    ? pathWithQueryParam(
        PATH_NAMES.RESEND_MFA_CODE_ACCOUNT_CREATION,
        "isResendCodeRequest",
        "true"
      )
    : PATH_NAMES.RESEND_MFA_CODE_ACCOUNT_CREATION;

  if (isLocked(req.session.user.wrongCodeEnteredLock)) {
    res.render("security-code-error/index-security-code-entered-exceeded.njk", {
      newCodeLink: newCodeLink,
      isAuthApp: false,
    });
  } else if (isLocked(req.session.user.codeRequestLock)) {
    res.render("security-code-error/index-wait.njk", {
      newCodeLink,
      isAccountCreationJourney: req.session.user.isAccountCreationJourney,
    });
  } else {
    res.render("account-creation/resend-mfa-code/index.njk", {
      phoneNumber: getDefaultSmsMfaMethod(req.session.user.mfaMethods)
        ?.redactedPhoneNumber,
      isResendCodeRequest: req.query?.isResendCodeRequest,
    });
  }
}

export const resendMfaCodePost = (
  service: SendNotificationServiceInterface = sendNotificationService()
): ExpressRouteFunc => {
  return async function (req: Request, res: Response) {
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;
    const { email, mfaMethods } = req.session.user;
    const phoneNumber = getDefaultSmsMfaMethod(mfaMethods)?.phoneNumber;

    const journeyType = isAccountRecoveryJourney(req)
      ? JOURNEY_TYPE.ACCOUNT_RECOVERY
      : JOURNEY_TYPE.REGISTRATION;

    const sendNotificationResponse = await service.sendNotification(
      sessionId,
      clientSessionId,
      email,
      NOTIFICATION_TYPE.VERIFY_PHONE_NUMBER,
      persistentSessionId,
      xss(req.cookies.lng as string),
      req,
      journeyType,
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
