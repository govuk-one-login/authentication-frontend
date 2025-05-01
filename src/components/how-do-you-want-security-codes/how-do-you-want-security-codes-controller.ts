import type { Request, Response } from "express";
import { PATH_NAMES } from "../../app.constants.js";
import type { MfaMethod } from "../../types.js";

export function sortMfaMethodsBackupFirst(
  mfaMethods: MfaMethod[]
): MfaMethod[] {
  return mfaMethods
    .slice()
    .sort((a, b) => a.priority.localeCompare(b.priority, "en"));
}

export function howDoYouWantSecurityCodesGet(
  req: Request,
  res: Response
): void {
  res.render("how-do-you-want-security-codes/index.njk", {
    mfaResetLink: PATH_NAMES.MFA_RESET_WITH_IPV,
    mfaMethods: sortMfaMethodsBackupFirst(req.session.user.mfaMethods || []),
  });
}

export function howDoYouWantSecurityCodesPost(
  req: Request,
  res: Response
): void {
  res.send("Unimplemented");
}
