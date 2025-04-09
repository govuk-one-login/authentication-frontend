import { PATH_NAMES, MFA_METHOD_TYPE } from "../../../app.constants.js";
import type { Request, Response, NextFunction } from "express";
import { getNextPathAndUpdateJourney } from "../../common/constants.js";
import { USER_JOURNEY_EVENTS } from "../../common/state-machine/state-machine.js";
export function checkAccountRecoveryPermitted(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.session.user.isAccountRecoveryPermitted === true) {
    req.session.user.isAccountRecoveryJourney = true;
    getNextPathAndUpdateJourney(
      req,
      req.path,
      USER_JOURNEY_EVENTS.CHANGE_SECURITY_CODES_REQUESTED,
      null,
      res.locals.sessionId
    );
    return next();
  }

  req.session.user.isAccountRecoveryJourney = false;
  const type = req.query.type;

  if (type === MFA_METHOD_TYPE.AUTH_APP) {
    return res.redirect(PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE);
  }

  if (type === MFA_METHOD_TYPE.SMS) {
    return res.redirect(PATH_NAMES.CHECK_YOUR_PHONE);
  }

  throw new Error(
    "Attempted to access /check-your-email without a valid request type"
  );
}
