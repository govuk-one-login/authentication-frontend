import { Request, Response } from "express";
import { NOTIFICATION_TYPE } from "../../app.constants";
import { ExpressRouteFunc } from "../../types";
import { redactPhoneNumber } from "../../utils/strings";
import {
  getErrorPathByCode,
  getNextPathAndUpdateJourney,
} from "../common/constants";
import { BadRequestError } from "../../utils/error";
import { updateProfileService } from "../common/update-profile/update-profile-service";
import { UpdateProfileServiceInterface } from "../common/update-profile/types";
import { SendNotificationServiceInterface } from "../common/send-notification/types";
import { sendNotificationService } from "../common/send-notification/send-notification-service";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";

export function enterPhoneNumberGet(req: Request, res: Response): void {
  res.render("enter-phone-number/index.njk");
}

export function enterPhoneNumberPost(
  service: SendNotificationServiceInterface = sendNotificationService(),
  profileService: UpdateProfileServiceInterface = updateProfileService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const phoneNumber = req.body.phoneNumber;
    const { email } = req.session.user;
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;

    req.session.user.phoneNumber = redactPhoneNumber(phoneNumber);

    const updateProfileResponse = await profileService.updateProfile(
      sessionId,
      clientSessionId,
      email,
      {
        profileInformation: phoneNumber,
        updateProfileType: "ADD_PHONE_NUMBER",
      },
      req.ip,
      persistentSessionId
    );

    if (!updateProfileResponse.success) {
      throw new BadRequestError(
        updateProfileResponse.data.message,
        updateProfileResponse.data.code
      );
    }

    const sendNotificationResponse = await service.sendNotification(
      sessionId,
      clientSessionId,
      email,
      NOTIFICATION_TYPE.VERIFY_PHONE_NUMBER,
      req.ip,
      persistentSessionId,
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
        sessionId
      )
    );
  };
}
