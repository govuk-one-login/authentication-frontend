import { Request, Response } from "express";
import { getNextPathAndUpdateJourney } from "../common/constants";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";

export function getSecurityCodesGet(_req: Request, res: Response): void {
  res.render("select-mfa-options/index.njk");
}

export function getSecurityCodesPost(req: Request, res: Response): void {
  res.redirect(
    getNextPathAndUpdateJourney(
      req,
      req.path,
      req.body.mfaOptions === "AUTH_APP"
        ? USER_JOURNEY_EVENTS.MFA_OPTION_AUTH_APP_SELECTED
        : USER_JOURNEY_EVENTS.MFA_OPTION_SMS_SELECTED,
      null,
      res.locals.sessionId
    )
  );
}
