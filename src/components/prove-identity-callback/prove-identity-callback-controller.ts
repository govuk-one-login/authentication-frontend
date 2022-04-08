import { Request, Response } from "express";
import { getNextPathAndUpdateJourney } from "../common/constants";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";

export function proveIdentityCallbackGet(req: Request, res: Response): void {
  const { clientSessionId } = res.locals;

  const redirectPath = getNextPathAndUpdateJourney(
    req,
    req.path,
    USER_JOURNEY_EVENTS.PROVE_IDENTITY_CALLBACK,
    {},
    clientSessionId
  );

  res.redirect(redirectPath);
}
