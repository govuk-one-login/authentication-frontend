import { Request, Response } from "express";
import { ERROR_CODES, PATH_NAMES } from "../../app.constants";
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
    const { email } = req.session.user;
    const id = res.locals.sessionId;

    req.session.user.phoneNumber = redactPhoneNumber(phoneNumber);

    await service.updateProfile(id, email, phoneNumber);
    const result = await service.sendPhoneVerificationNotification(
      id,
      email,
      phoneNumber
    );

    if (!result.success) {
      if (result.code === ERROR_CODES.REQUESTED_TOO_MANY_SECURITY_CODES) {
        return res.redirect(PATH_NAMES.SECURITY_CODE_REQUEST_EXCEEDED);
      }
      return res.redirect(PATH_NAMES.SECURITY_CODE_WAIT);
    }

    return res.redirect(PATH_NAMES.CHECK_YOUR_PHONE);
  };
}
