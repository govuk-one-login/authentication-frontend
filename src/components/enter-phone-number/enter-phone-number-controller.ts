import { Request, Response } from "express";
import { JOURNEY_TYPE, NOTIFICATION_TYPE } from "../../app.constants";
import { ExpressRouteFunc } from "../../types";
import { redactPhoneNumber } from "../../utils/strings";
import {
  getErrorPathByCode,
  getNextPathAndUpdateJourney,
} from "../common/constants";
import { BadRequestError } from "../../utils/error";
import { SendNotificationServiceInterface } from "../common/send-notification/types";
import { sendNotificationService } from "../common/send-notification/send-notification-service";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";
import { convertInternationalPhoneNumberToE164Format } from "../../utils/phone-number";
import {
  supportAccountRecovery,
  supportInternationalNumbers,
} from "../../config";
import xss from "xss";

export function enterPhoneNumberGet(req: Request, res: Response): void {
  res.render("enter-phone-number/index.njk", {
    supportInternationalNumbers: supportInternationalNumbers() ? true : null,
    isAccountPartCreated: req.session.user.isAccountPartCreated,
  });
}

export function enterPhoneNumberPost(
  service: SendNotificationServiceInterface = sendNotificationService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { email, isAccountRecoveryJourney, isAccountRecoveryPermitted } =
      req.session.user;
    const hasInternationalPhoneNumber = req.body.hasInternationalPhoneNumber;
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;
    const isAccountRecoveryEnabledForEnvironment = supportAccountRecovery();
    let phoneNumber;

    if (
      hasInternationalPhoneNumber === "true" &&
      supportInternationalNumbers()
    ) {
      phoneNumber = convertInternationalPhoneNumberToE164Format(
        req.body.internationalPhoneNumber
      );
    } else {
      phoneNumber = req.body.phoneNumber;
    }

    req.session.user.redactedPhoneNumber = redactPhoneNumber(phoneNumber);
    req.session.user.phoneNumber = phoneNumber;

    const accountRecovery =
      isAccountRecoveryJourney &&
      isAccountRecoveryPermitted &&
      isAccountRecoveryEnabledForEnvironment;

    const journeyType = accountRecovery
      ? JOURNEY_TYPE.ACCOUNT_RECOVERY
      : JOURNEY_TYPE.REGISTRATION;

    const sendNotificationResponse = await service.sendNotification(
      sessionId,
      clientSessionId,
      email,
      NOTIFICATION_TYPE.VERIFY_PHONE_NUMBER,
      req.ip,
      persistentSessionId,
      xss(req.cookies.lng as string),
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

    return res.redirect(
      getNextPathAndUpdateJourney(
        req,
        req.path,
        USER_JOURNEY_EVENTS.VERIFY_PHONE_NUMBER,
        null,
        sessionId
      )
    );
  };
}
