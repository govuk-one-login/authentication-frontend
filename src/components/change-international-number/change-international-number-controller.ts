import type { Request, Response } from "express";
import { getNextPathAndUpdateJourney } from "../common/state-machine/state-machine-executor.js";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine.js";

export function changeInternationalNumberGet(
  req: Request,
  res: Response
): void {
  res.render("change-international-number/index.njk");
}

export async function changeInternationalNumberPost(
  req: Request,
  res: Response
): Promise<void> {
  req.session.user.isAccountRecoveryJourney = true;

  res.redirect(
    await getNextPathAndUpdateJourney(
      req,
      res,
      USER_JOURNEY_EVENTS.START_MFA_RESET
    )
  );
}
