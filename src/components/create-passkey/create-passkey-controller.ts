import type { Request, Response } from "express";
import { getNextPathAndUpdateJourney } from "../common/state-machine/state-machine-executor.js";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine.js";
import { saveSessionState } from "../common/constants.js";

const TEMPLATE_NAME = "create-passkey/index.njk";

export function createPasskeyGet(req: Request, res: Response): void {
  return res.render(TEMPLATE_NAME);
}

export async function createPasskeyPost(
  req: Request,
  res: Response
): Promise<void> {
  let userJourneyEvent;
  if (req.body.createPasskeyOption === "submit") {
    userJourneyEvent = USER_JOURNEY_EVENTS.CREATE_PASSKEY;
  } else if (req.body.createPasskeyOption === "skip") {
    req.session.user.hasSkippedPasskeyRegistration = true;
    await saveSessionState(req);
    userJourneyEvent = USER_JOURNEY_EVENTS.SKIP_CREATE_PASSKEY;
  } else {
    throw new Error(
      `Invalid createPasskeyOption: ${req.body.createPasskeyOption}`
    );
  }
  return res.redirect(
    await getNextPathAndUpdateJourney(req, res, userJourneyEvent)
  );
}
