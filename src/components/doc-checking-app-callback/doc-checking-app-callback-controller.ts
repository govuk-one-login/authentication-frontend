import type { Request, Response } from "express";
import { getNextPathAndUpdateJourney } from "../common/constants.js";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine.js";
export async function docCheckingAppCallbackGet(
  req: Request,
  res: Response
): Promise<void> {
  const { sessionId } = res.locals;

  const redirectPath = await getNextPathAndUpdateJourney(
    req,
    req.path,
    USER_JOURNEY_EVENTS.DOC_CHECKING_AUTH_CALLBACK,
    null,
    sessionId
  );

  res.redirect(redirectPath);
}
