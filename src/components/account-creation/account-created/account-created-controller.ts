import type { Request, Response } from "express";
import { getNextPathAndUpdateJourney } from "../../common/constants.js";
import { USER_JOURNEY_EVENTS } from "../../common/state-machine/state-machine.js";
export function accountCreatedGet(req: Request, res: Response): void {
  const { serviceType, name } = req.session.client;

  res.render("account-created/index.njk", {
    serviceType,
    name,
    strategicAppChannel: res.locals.strategicAppChannel,
  });
}

export async function accountCreatedPost(
  req: Request,
  res: Response
): Promise<void> {
  const nextPath = await getNextPathAndUpdateJourney(
    req,
    req.path,
    USER_JOURNEY_EVENTS.ACCOUNT_CREATED,
    res.locals.sessionId
  );

  res.redirect(nextPath);
}
