import { Request, Response } from "express";
import { getNextPathAndUpdateJourney } from "../common/constants";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";
import { PATH_NAMES } from "../../app.constants";
import { proveIdentityWelcomeEnabled } from "../../config";
export function proveIdentityWelcomeGet(req: Request, res: Response): void {
  if (!proveIdentityWelcomeEnabled()) {
    res.redirect("/sign-in-or-create");
  } else {
    res.render(
      req.session.user.isAuthenticated
        ? "prove-identity-welcome/index-existing-session.njk"
        : "prove-identity-welcome/index.njk"
    );
  }
}

export async function proveIdentityWelcomePost(
  req: Request,
  res: Response
): Promise<void> {
  const event = req.session.user.isAuthenticated
    ? USER_JOURNEY_EVENTS.EXISTING_SESSION
    : USER_JOURNEY_EVENTS.CREATE_OR_SIGN_IN;

  const nextPath = await getNextPathAndUpdateJourney(
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
