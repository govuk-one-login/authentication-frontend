import type { Request, Response } from "express";
import type { ExpressRouteFunc } from "../../types.js";
import { getNextPathAndUpdateJourney } from "../common/state-machine/state-machine-executor.js";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine.js";

export function accountExistsWithPasskeyGet(req: Request, res: Response): void {
  const { email } = req.session.user;
  res.render("account-exists-with-passkey/index.njk", {
    email: email,
  });
}

export function accountExistsWithPasskeyPost(): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    res.redirect(
      await getNextPathAndUpdateJourney(
        req,
        res,
        USER_JOURNEY_EVENTS.SIGN_IN_WITH_PASSKEY
      )
    );
  };
}
