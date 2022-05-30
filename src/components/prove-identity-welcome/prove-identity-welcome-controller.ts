import { Request, Response } from "express";
import { getNextPathAndUpdateJourney } from "../common/constants";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";
import { IPV_ERROR_CODES, OIDC_ERRORS, PATH_NAMES } from "../../app.constants";

function getUseAlternativePYIMethodError(redirectUri: string) {
  const redirect = new URL(redirectUri);
  redirect.searchParams.append("error", OIDC_ERRORS.ACCESS_DENIED);
  redirect.searchParams.append(
    "error_description",
    IPV_ERROR_CODES.AccountNotCreated_IPV
  );
  return redirect.href;
}
export function proveIdentityWelcomeGet(req: Request, res: Response): void {
  res.render(
    req.session.user.isAuthenticated
      ? "prove-identity-welcome/index-existing-session.njk"
      : "prove-identity-welcome/index.njk",
    {
      redirectUri: getUseAlternativePYIMethodError(
        req.session.client.redirectUri
      ),
    }
  );
}

export function proveIdentityWelcomePost(req: Request, res: Response): void {
  const redirect = req.body.chooseWayPyi === "redirect";

  if (redirect) {
    return res.redirect(
      getUseAlternativePYIMethodError(req.session.client.redirectUri)
    );
  }

  const event = req.session.user.isAuthenticated
    ? USER_JOURNEY_EVENTS.EXISTING_SESSION
    : USER_JOURNEY_EVENTS.CREATE_OR_SIGN_IN;

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
