import { Request, Response } from "express";
import { PATH_NAMES } from "../../app.constants";
import { getNextPathAndUpdateJourney } from "../common/constants";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";

export function landingGet(req: Request, res: Response): void {
  return res.redirect(
    getNextPathAndUpdateJourney(req, PATH_NAMES.ROOT, USER_JOURNEY_EVENTS.ROOT)
  );
}
