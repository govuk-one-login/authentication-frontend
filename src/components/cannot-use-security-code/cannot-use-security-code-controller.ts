import type { Request, Response } from "express";
import { PATH_NAMES } from "../../app.constants.js";

export function cannotUseSecurityCodeGet(req: Request, res: Response): void {
  return res.render("cannot-use-security-code/index.njk", {
    changeSecurityCodesLink: PATH_NAMES.MFA_RESET_WITH_IPV,
  });
}
