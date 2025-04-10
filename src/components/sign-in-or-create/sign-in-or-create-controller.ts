import type { Request, Response } from "express";
import { getNextPathAndUpdateJourney } from "../common/constants.js";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine.js";
import { getChannelSpecificTemplate } from "../../utils/get-channel-specific-template.js";
import { WEB_TO_MOBILE_TEMPLATE_MAPPINGS } from "../../app.constants.js";
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

  const template = getChannelSpecificTemplate(
    "sign-in-or-create/index.njk",
    res.locals.strategicAppChannel,
    WEB_TO_MOBILE_TEMPLATE_MAPPINGS
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
