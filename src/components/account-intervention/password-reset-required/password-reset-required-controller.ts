import { Request, Response } from "express";
import { PATH_NAMES } from "../../../app.constants";

export function passwordResetRequiredGet(req: Request, res: Response): void {
  res.render("account-intervention/password-reset-required/index.njk", {
    resetPasswordCheckEmailURL: PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL,
  });
}
