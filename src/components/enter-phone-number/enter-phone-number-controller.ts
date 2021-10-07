import { Request, Response } from "express";
import { NOTIFICATION_TYPE } from "../../app.constants";
import { ExpressRouteFunc } from "../../types";
import { redactPhoneNumber } from "../../utils/strings";
import { getNextPathByState } from "../common/constants";
import { BadRequestError } from "../../utils/error";
import { updateProfileService } from "../common/update-profile/update-profile-service";
import { UpdateProfileServiceInterface } from "../common/update-profile/types";
import { SendNotificationServiceInterface } from "../common/send-notification/types";
import { sendNotificationService } from "../common/send-notification/send-notification-service";

export function enterPhoneNumberGet(req: Request, res: Response): void {
  res.render("enter-phone-number/index.njk");
}

export function enterPhoneNumberPost(
  service: SendNotificationServiceInterface = sendNotificationService(),
  profileService: UpdateProfileServiceInterface = updateProfileService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const phoneNumber = req.body.phoneNumber;
    const { email } = req.session;
    const id = res.locals.sessionId;
    const clientSessionId = res.locals.clientSessionId;

    req.session.phoneNumber = redactPhoneNumber(phoneNumber);

    const updateProfileResponse = await profileService.updateProfile(
      id,
      clientSessionId,
      email,
      {
        profileInformation: phoneNumber,
        updateProfileType: "ADD_PHONE_NUMBER",
      },
      req.ip
    );

    if (!updateProfileResponse.success) {
      throw new BadRequestError(
        updateProfileResponse.message,
        updateProfileResponse.code
      );
    }

    const sendNotificationResponse = await service.sendNotification(
      id,
      email,
      NOTIFICATION_TYPE.VERIFY_PHONE_NUMBER,
      req.ip,
      phoneNumber
    );

    if (!sendNotificationResponse.success && sendNotificationResponse.code) {
      throw new BadRequestError(
        sendNotificationResponse.message,
        sendNotificationResponse.code
      );
    }

    req.session.nextState = sendNotificationResponse.sessionState;

    return res.redirect(
      getNextPathByState(sendNotificationResponse.sessionState)
    );
  };
}
