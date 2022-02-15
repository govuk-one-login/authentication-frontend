import { Request, Response } from "express";
import { getNextPathAndUpdateJourney } from "../common/constants";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";

export function accountCreatedGet(req: Request, res: Response): void {
  const { serviceType, name } = req.session.client;

  const nextPath = getNextPathAndUpdateJourney(
    req,
    req.path,
    USER_JOURNEY_EVENTS.ACCOUNT_CREATED,
    {
      isConsentRequired: req.session.user.isConsentRequired,
    },
    res.locals.sessionId
  );

  res.render("account-created/index.njk", {
    linkUrl: nextPath,
    serviceType,
    name,
  });
}
