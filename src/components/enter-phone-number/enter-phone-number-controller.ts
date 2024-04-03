import { Request, Response } from "express";
import { JOURNEY_TYPE, NOTIFICATION_TYPE } from "../../app.constants";
import { ExpressRouteFunc } from "../../types";
import { redactPhoneNumber } from "../../utils/strings";
import {
  ERROR_CODES,
  getErrorPathByCode,
  getNextPathAndUpdateJourney,
  SecurityCodeErrorType,
} from "../common/constants";
import { BadRequestError } from "../../utils/error";
import { SendNotificationServiceInterface } from "../common/send-notification/types";
import { sendNotificationService } from "../common/send-notification/send-notification-service";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";
import { convertInternationalPhoneNumberToE164Format } from "../../utils/phone-number";
import { support2hrLockout, supportAccountRecovery } from "../../config";
import xss from "xss";
import { getNewCodePath } from "../security-code-error/security-code-error-controller";

const oplValues = {
  createAccount: {
    contentId: "0f519eb6-5cd4-476f-968f-d847b3c4c034",
    taxonomyLevel2: "create account",
  },  
  accountRecovery: {
    contentId: "cbca1676-f632-4937-984e-1ae5934d13e2",
    taxonomyLevel2: "account recovery",
  }};

export function enterPhoneNumberGet(req: Request, res: Response): void {
  const { isAccountRecoveryJourney, isAccountRecoveryPermitted } =
  req.session.user;
  const isAccountRecoveryEnabledForEnvironment = supportAccountRecovery();

  const accountRecovery =
  isAccountRecoveryJourney &&
  isAccountRecoveryPermitted &&
  isAccountRecoveryEnabledForEnvironment;

  res.render("enter-phone-number/index.njk", {
    isAccountPartCreated: req.session.user.isAccountPartCreated,
    contentId: accountRecovery ? oplValues.accountRecovery.contentId : oplValues.createAccount.contentId,
    taxonomyLevel2: accountRecovery ? oplValues.accountRecovery.taxonomyLevel2 : oplValues.createAccount.taxonomyLevel2
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

    if (hasInternationalPhoneNumber === "true") {
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
      if (
        sendNotificationResponse.data.code ==
        ERROR_CODES.VERIFY_PHONE_NUMBER_MAX_CODES_SENT
      ) {
        return res.render("security-code-error/index-wait.njk", {
          newCodeLink: getNewCodePath(
            req.query.actionType as SecurityCodeErrorType
          ),
          support2hrLockout: support2hrLockout(),
          isAccountCreationJourney:
            req.session.user.isAccountCreationJourney ||
            req.session.user.isAccountPartCreated,
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
