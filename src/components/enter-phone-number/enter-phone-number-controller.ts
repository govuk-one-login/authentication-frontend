import { Request, Response } from "express";
import { PATH_NAMES } from "../../app.constants";
import { ExpressRouteFunc } from "../../types";
import { EnterPhoneNumberServiceInterface } from "./types";
import { enterPhoneNumberService } from "./enter-phone-number-service";
import { redactPhoneNumber } from "../../utils/strings";
import { getNextPathRateLimit } from "../common/constants";
import { BadRequestError } from "../../utils/error";

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
      if (result.sessionState) {
        return res.redirect(getNextPathRateLimit(result.sessionState));
      }
      throw new BadRequestError(result.message, result.code);
    }

    return res.redirect(PATH_NAMES.CHECK_YOUR_PHONE);
  };
}
