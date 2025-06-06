import type { Request, Response } from "express";
import { getNextPathAndUpdateJourney } from "../common/constants.js";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine.js";
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

  const template = getTemplate(
    res.locals.genericAppChannel,
    res.locals.strategicAppChannel
  );

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

function getTemplate(isGenericApp: boolean, isStrategicApp: boolean) {
  if (isGenericApp) {
    return "sign-in-or-create/index-generic-app.njk";
  }
  if (isStrategicApp) {
    return "sign-in-or-create/index-strategic-app.njk";
  }
  return "sign-in-or-create/index.njk";
}
