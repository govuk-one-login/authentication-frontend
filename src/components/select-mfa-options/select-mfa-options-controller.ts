import { Request, Response } from "express";
import { getNextPathAndUpdateJourney } from "../common/constants";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";
import { generateMfaSecret } from "../../utils/mfa";

export function getSecurityCodesGet(_req: Request, res: Response): void {
  res.render("select-mfa-options/index.njk");
}

export function getSecurityCodesPost(req: Request, res: Response): void {
  const isAuthApp = req.body.mfaOptions === "AUTH_APP";

  if (isAuthApp) {
    req.session.user.authAppSecret = generateMfaSecret();
  }

  res.redirect(
    getNextPathAndUpdateJourney(
      req,
      req.path,
      isAuthApp
        ? USER_JOURNEY_EVENTS.MFA_OPTION_AUTH_APP_SELECTED
        : USER_JOURNEY_EVENTS.MFA_OPTION_SMS_SELECTED,
      null,
      res.locals.sessionId
    )
  );
}
