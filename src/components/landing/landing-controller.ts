import type { Request, Response } from "express";
import { PATH_NAMES } from "../../app.constants.js";
import { getNextPathAndUpdateJourney } from "../common/constants.js";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine.js";
export async function landingGet(req: Request, res: Response): Promise<void> {
  return res.redirect(
    await getNextPathAndUpdateJourney(
      req,
      PATH_NAMES.ROOT,
      USER_JOURNEY_EVENTS.ROOT
    )
  );
}
