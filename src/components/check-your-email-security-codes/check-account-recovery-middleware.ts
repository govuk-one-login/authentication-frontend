import { PATH_NAMES, MFA_METHOD_TYPE } from "../../app.constants";
import { Request, Response, NextFunction } from "express";
import { getNextPathAndUpdateJourney } from "../common/constants";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";

export function checkAccountRecoveryPermitted(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.session.user.isAccountRecoveryPermitted === true) {
    getNextPathAndUpdateJourney(
      req,
      req.path,
      USER_JOURNEY_EVENTS.CHANGE_SECURITY_CODES_REQUESTED,
     null,
      res.locals.sessionId
    )
    return next();
  }

  const type = req.query.type;

  if (type === MFA_METHOD_TYPE.AUTH_APP) {
    return res.redirect(PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE);
  }

  if (type === MFA_METHOD_TYPE.SMS) {
    return res.redirect(PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES);
  }

  throw new Error(
    "Attempted to access /check-your-email without a valid request type"
  );
}
