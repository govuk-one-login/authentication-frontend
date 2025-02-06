import { getNextPathAndUpdateJourney } from "../common/constants";
import { Request, Response, NextFunction } from "express";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";

export function checkAccountRecoveryPermittedViaIpv(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.session.user.isAccountRecoveryPermitted === true) {
    console.log(`BECKA current next path is ${req.session.user.journey.nextPath}`)
    getNextPathAndUpdateJourney(
      req,
      req.path,
      USER_JOURNEY_EVENTS.CHANGE_SECURITY_CODES_REQUESTED_VIA_IPV,
      res.locals.sessionId
    );
    console.log(`BECKA now it's ${req.session.user.journey.nextPath}`)

    return next();
  }

  req.session.user.isAccountRecoveryJourney = false;

  throw new Error(
    "User started IPV reverification journey without being permitted. This should be replaced with an appropriate error page"
  );
}
