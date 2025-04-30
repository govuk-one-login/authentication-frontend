import type { Request, Response } from "express";
import { PATH_NAMES } from "../../app.constants.js";

export function howDoYouWantSecurityCodesGet(
  req: Request,
  res: Response
): void {
  res.render("how-do-you-want-security-codes/index.njk", {
    mfaResetLink: PATH_NAMES.MFA_RESET_WITH_IPV,
  });
}
