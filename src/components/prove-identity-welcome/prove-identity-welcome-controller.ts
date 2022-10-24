import { Request, Response } from "express";
import { getNextPathAndUpdateJourney } from "../common/constants";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";
import { IPV_ERROR_CODES, OIDC_ERRORS, PATH_NAMES } from "../../app.constants";
import { createServiceRedirectErrorUrl } from "../../utils/error";
import { supportLanguageCY } from "../../config";

export function proveIdentityWelcomeGet(req: Request, res: Response): void {
  res.render(
    req.session.user.isAuthenticated
      ? "prove-identity-welcome/index-existing-session.njk"
      : "prove-identity-welcome/index.njk",
    {
      redirectUri: createServiceRedirectErrorUrl(
        req.session.client.redirectUri,
        OIDC_ERRORS.ACCESS_DENIED,
        IPV_ERROR_CODES.ACCOUNT_NOT_CREATED,
        req.session.client.state
      ),
      supportLanguageCY: supportLanguageCY() ? true : null,
    }
  );
}

export function proveIdentityWelcomePost(req: Request, res: Response): void {
  const redirect = req.body.chooseWayPyi === "redirect";

  if (redirect) {
    return res.redirect(
      createServiceRedirectErrorUrl(
        req.session.client.redirectUri,
        OIDC_ERRORS.ACCESS_DENIED,
        IPV_ERROR_CODES.ACCOUNT_NOT_CREATED,
        req.session.client.state
      )
    );
  }

  const event = req.session.user.isAuthenticated
    ? USER_JOURNEY_EVENTS.EXISTING_SESSION
    : USER_JOURNEY_EVENTS.PHOTO_ID;

  const nextPath = getNextPathAndUpdateJourney(
    req,
    PATH_NAMES.PROVE_IDENTITY_WELCOME,
    event,
    {
      isAuthenticated: req.session.user.isAuthenticated,
      requiresUplift: req.session.user.isUpliftRequired,
      prompt: req.session.client.prompt,
    },
    res.locals.sessionId
  );

  res.redirect(nextPath);
}
