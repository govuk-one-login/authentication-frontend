import type { Request, Response } from "express";
import { isLocked } from "../../utils/lock-helper.js";

export function renderLockoutPageIfLocked(
  req: Request,
  res: Response,
  newCodeLink: string
): boolean {
  if (isLocked(req.session.user.wrongCodeEnteredLock)) {
    res.render("security-code-error/index-security-code-entered-exceeded.njk", {
      newCodeLink,
      isAuthApp: false,
      show2HrScreen:
        req.session.user.isSignInJourney &&
        !req.session.user.isAccountRecoveryJourney,
    });
    return true;
  }

  if (isLocked(req.session.user.codeRequestLock)) {
    res.render("security-code-error/index-wait.njk");
    return true;
  }

  return false;
}
