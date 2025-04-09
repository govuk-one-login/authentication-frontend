import { Request, Response } from "express";
import { PATH_NAMES } from "../../../app.constants.js";
export function passwordResetRequiredGet(req: Request, res: Response): void {
  req.session.user.withinForcedPasswordResetJourney = true;
  res.render("account-intervention/password-reset-required/index.njk", {
    resetPasswordCheckEmailURL: PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL,
  });
}
