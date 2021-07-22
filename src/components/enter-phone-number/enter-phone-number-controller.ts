import { Request, Response } from "express";
import { PATH_NAMES } from "../../app.constants";
import { ExpressRouteFunc } from "../../types";
import { EnterPhoneNumberServiceInterface } from "./types";
import { enterPhoneNumberService } from "./enter-phone-number-service";
import { redactPhoneNumber } from "../../utils/strings";

export function enterPhoneNumberGet(req: Request, res: Response): void {
  res.render("enter-phone-number/index.njk");
}

export function enterPhoneNumberPost(
  service: EnterPhoneNumberServiceInterface = enterPhoneNumberService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const phoneNumber = req.body.phoneNumber;
    const { email, id } = req.session.user;

    req.session.user.phoneNumber = redactPhoneNumber(phoneNumber);

    if (await service.updateProfile(id, email, phoneNumber)) {
      await service.sendPhoneVerificationNotification(id, email, phoneNumber);
      res.redirect(PATH_NAMES.CHECK_YOUR_PHONE);
    } else {
      throw new Error("Unable to update user profile");
    }
  };
}
