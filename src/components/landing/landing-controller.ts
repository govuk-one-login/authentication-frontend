import { Request, Response } from "express";
import { PATH_NAMES } from "../../app.constants";
import { getNextPathAndUpdateJourney } from "../common/constants";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";

export async function landingGet(req: Request, res: Response): Promise<void> {
  return res.redirect(
    await getNextPathAndUpdateJourney(
      req,
      PATH_NAMES.ROOT,
      USER_JOURNEY_EVENTS.ROOT
    )
  );
}
