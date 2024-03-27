import { Request, Response } from "express";
import { getNextPathAndUpdateJourney } from "../common/constants";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";
import { supportInternationalNumbers } from "../../config";

export function signInOrCreateGet(req: Request, res: Response): void {
  req.session.user.isAccountCreationJourney = false;
  req.session.user.isPasswordResetJourney = false;
  req.session.user.isSignInJourney = false;
  if (req.query.redirectPost) {
    return signInOrCreatePost(req, res);
  }
  res.render("sign-in-or-create/index.njk", {
    serviceType: req.session.client.serviceType,
    supportInternationalNumbers: supportInternationalNumbers() ? true : null,
  });
}

export function signInOrCreatePost(req: Request, res: Response): void {
  res.redirect(
    getNextPathAndUpdateJourney(
      req,
      req.path,
      req.body.optionSelected === "create"
        ? USER_JOURNEY_EVENTS.CREATE_NEW_ACCOUNT
        : USER_JOURNEY_EVENTS.SIGN_IN,
      null,
      res.locals.sessionId
    )
  );
}
