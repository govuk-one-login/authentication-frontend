import type { Request, Response } from "express";
import { JOURNEY_TYPE, NOTIFICATION_TYPE } from "../../app.constants.js";
import type { ExpressRouteFunc } from "../../types.js";
import { redactPhoneNumber } from "../../utils/strings.js";
import type { SecurityCodeErrorType } from "../common/constants.js";
import {
  ERROR_CODES,
  getErrorPathByCode,
  getNextPathAndUpdateJourney,
} from "../common/constants.js";
import { BadRequestError } from "../../utils/error.js";
import type { SendNotificationServiceInterface } from "../common/send-notification/types.js";
import { sendNotificationService } from "../common/send-notification/send-notification-service.js";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine.js";
import { convertInternationalPhoneNumberToE164Format } from "../../utils/phone-number.js";
import xss from "xss";
import { getNewCodePath } from "../security-code-error/security-code-error-controller.js";
import { isAccountRecoveryJourneyAndPermitted } from "../../utils/request.js";
import { upsertDefaultSmsMfaMethod } from "../../utils/mfa.js";

export function enterPhoneNumberGet(req: Request, res: Response): void {
  res.render("enter-phone-number/index.njk", {
    isAccountPartCreated: req.session.user.isAccountPartCreated,
  });
}

export function enterPhoneNumberPost(
  service: SendNotificationServiceInterface = sendNotificationService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { email } = req.session.user;
    const hasInternationalPhoneNumber = req.body.hasInternationalPhoneNumber;
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;
    let phoneNumber;

    if (hasInternationalPhoneNumber === "true") {
      phoneNumber = convertInternationalPhoneNumberToE164Format(
        req.body.internationalPhoneNumber
      );
    } else {
      phoneNumber = req.body.phoneNumber;
    }

    req.session.user.mfaMethods = upsertDefaultSmsMfaMethod(
      req.session.user.mfaMethods,
      { phoneNumber, redactedPhoneNumber: redactPhoneNumber(phoneNumber) }
    );

    const journeyType = isAccountRecoveryJourneyAndPermitted(req)
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
      if (
        sendNotificationResponse.data.code ==
        ERROR_CODES.VERIFY_PHONE_NUMBER_MAX_CODES_SENT
      ) {
        return res.render("security-code-error/index-wait.njk", {
          newCodeLink: getNewCodePath(
            req.query.actionType as SecurityCodeErrorType
          ),
          isAccountCreationJourney:
            req.session.user.isAccountCreationJourney ||
            req.session.user.isAccountPartCreated,
          contentId: "",
        });
      }
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
      await getNextPathAndUpdateJourney(
        req,
        USER_JOURNEY_EVENTS.VERIFY_PHONE_NUMBER,
        null,
        sessionId
      )
    );
  };
}
