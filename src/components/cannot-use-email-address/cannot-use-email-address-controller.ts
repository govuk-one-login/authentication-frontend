import type { Request, Response } from "express";
import { getNextPathAndUpdateJourney } from "../common/state-machine/state-machine-executor.js";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine.js";

export function cannotUseEmailAddressGet(req: Request, res: Response): void {
  return res.status(403).render("cannot-use-email-address/index.njk");
}

export async function cannotUseEmailAddressContinueGet(
  req: Request,
  res: Response
): Promise<void> {
  return res.redirect(
    await getNextPathAndUpdateJourney(req, res, USER_JOURNEY_EVENTS.ENTER_EMAIL)
  );
}
