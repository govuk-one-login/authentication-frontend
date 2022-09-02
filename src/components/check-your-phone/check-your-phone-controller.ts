import { Request, Response } from "express";
import { NOTIFICATION_TYPE } from "../../app.constants";
import { VerifyCodeInterface } from "../common/verify-code/types";
import { codeService } from "../common/verify-code/verify-code-service";
import { verifyCodePost } from "../common/verify-code/verify-code-controller";
import { ExpressRouteFunc } from "../../types";
import { ERROR_CODES, getNextPathAndUpdateJourney } from "../common/constants";
import { SendNotificationServiceInterface } from "../common/send-notification/types";
import { sendNotificationService } from "../common/send-notification/send-notification-service";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";
import { supportMFAOptions } from "../../config";
import xss from "xss";

const TEMPLATE_NAME = "check-your-phone/index.njk";

export function checkYourPhoneGet(req: Request, res: Response): void {
  res.render(TEMPLATE_NAME, {
    phoneNumber: req.session.user.phoneNumber,
    supportMFAOptions: supportMFAOptions() ? true : null,
  });
}

export const checkYourPhonePost = (
  service: VerifyCodeInterface = codeService(),
  notificationService: SendNotificationServiceInterface = sendNotificationService()
): ExpressRouteFunc => {
  return verifyCodePost(service, {
    notificationType: NOTIFICATION_TYPE.VERIFY_PHONE_NUMBER,
    template: TEMPLATE_NAME,
    validationKey: "pages.checkYourPhone.code.validationError.invalidCode",
    validationErrorCode: ERROR_CODES.INVALID_VERIFY_PHONE_NUMBER_CODE,
    callback: async (req, res) => {
      await notificationService.sendNotification(
        res.locals.sessionId,
        res.locals.clientSessionId,
        req.session.user.email,
        NOTIFICATION_TYPE.ACCOUNT_CREATED_CONFIRMATION,
        req.ip,
        res.locals.persistentSessionId,
        xss(req.cookies.lng as string)
      );

      return res.redirect(
        getNextPathAndUpdateJourney(
          req,
          req.path,
          USER_JOURNEY_EVENTS.PHONE_NUMBER_VERIFIED,
          {
            isIdentityRequired: req.session.user.isIdentityRequired,
          },
          res.locals.sessionId
        )
      );
    },
  });
};
