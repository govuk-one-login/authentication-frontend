import type { Request, Response } from "express";
import { getNextPathAndUpdateJourney } from "../common/state-machine/state-machine-executor.js";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine.js";

export function passkeyCreatedGet(req: Request, res: Response): void {
  res.render("passkey-created/index.njk");
}

export async function passkeyCreatedPost(
  req: Request,
  res: Response
): Promise<void> {
  const nextPath = await getNextPathAndUpdateJourney(
    req,
    res,
    USER_JOURNEY_EVENTS.PASSKEY_CREATED
  );

  res.redirect(nextPath);
}
