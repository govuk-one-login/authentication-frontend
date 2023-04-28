import { Request, Response } from "express";
import { MFA_METHOD_TYPE, NOTIFICATION_TYPE } from "../../../app.constants";
import { SendNotificationServiceInterface } from "../../common/send-notification/types";
import { sendNotificationService } from "../../common/send-notification/send-notification-service";
import { ExpressRouteFunc } from "../../../types";
import xss from "xss";
import { USER_JOURNEY_EVENTS } from "../../common/state-machine/state-machine";
import { getNextPathAndUpdateJourney } from "../../common/constants";

export function changeSecurityCodesConfirmationGet(
  notificationService: SendNotificationServiceInterface = sendNotificationService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { email } = req.session.user;
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;
    const type = req.query.type;
    if (type === MFA_METHOD_TYPE.SMS || type === MFA_METHOD_TYPE.AUTH_APP) {
      await notificationService.sendNotification(
        sessionId,
        clientSessionId,
        email,
        NOTIFICATION_TYPE.CHANGE_HOW_GET_SECURITY_CODES_CONFIRMATION,
        req.ip,
        persistentSessionId,
        xss(req.cookies.lng as string)
      );

      res.render(
        "account-recovery/change-security-codes-confirmation/index.njk",
        {
          mfaMethodType: type,
          phoneNumber: req.session.user.redactedPhoneNumber,
        }
      );
    } else {
      throw new Error(
        "Attempted to access /change-security-codes-confirmation without a valid request type"
      );
    }
  };
}

export function changeSecurityCodesConfirmationPost(
  req: Request,
  res: Response
): void {
  const nextPath = getNextPathAndUpdateJourney(
    req,
    req.path,
    USER_JOURNEY_EVENTS.CHANGE_SECURITY_CODES_COMPLETED,
    null,
    res.locals.sessionId
  );
  res.redirect(nextPath);
}
