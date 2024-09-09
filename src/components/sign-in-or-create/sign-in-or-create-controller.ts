import { Request, Response } from "express";
import { getNextPathAndUpdateJourney } from "../common/constants";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";
import { mobileOrWebTemplate } from "../../utils/mobile-or-web-template";

export async function signInOrCreateGet(
  req: Request,
  res: Response
): Promise<void> {
  req.session.user.isAccountCreationJourney = false;
  req.session.user.isPasswordResetJourney = false;
  req.session.user.isSignInJourney = false;
  if (req.query.redirectPost) {
    return await signInOrCreatePost(req, res);
  }

  // Do not approve a PR with the following line
  // ===========================================
  // It is forcing the controller to render the
  // template that is intended for the mobile app.
  const template = mobileOrWebTemplate("sign-in-or-create/index.njk", true);

  res.render(template, {
    serviceType: req.session.client.serviceType,
  });
}

export async function signInOrCreatePost(
  req: Request,
  res: Response
): Promise<void> {
  res.redirect(
    await getNextPathAndUpdateJourney(
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
