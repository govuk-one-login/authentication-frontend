import { PATH_NAMES, MFA_METHOD_TYPE } from "../../app.constants";
import { Request, Response, NextFunction } from "express";

export function checkAccountRecoveryPermitted(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.session.user.isAccountRecoveryPermitted === true) {
    req.session.user.isCurrentlyInAccountRecoveryJourney = true;
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
