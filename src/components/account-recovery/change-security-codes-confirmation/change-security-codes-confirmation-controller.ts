import { Request, Response } from "express";
import { MFA_METHOD_TYPE } from "../../../app.constants";
import { ExpressRouteFunc } from "../../../types";
import { USER_JOURNEY_EVENTS } from "../../common/state-machine/state-machine";
import { getNextPathAndUpdateJourney } from "../../common/constants";
import { supportMfaResetWithIpv } from "../../../config";
import { getDefaultSmsMfaMethod } from "../../../utils/mfa";

export function changeSecurityCodesConfirmationGet(): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const type = req.session.user.accountRecoveryVerifiedMfaType;
    if (type === MFA_METHOD_TYPE.SMS || type === MFA_METHOD_TYPE.AUTH_APP) {
      res.render(
        "account-recovery/change-security-codes-confirmation/index.njk",
        {
          mfaMethodType: type,
          phoneNumber: getDefaultSmsMfaMethod(req.session.user.mfaMethods)
            ?.redactedPhoneNumber,
          supportMfaResetWithIpv: supportMfaResetWithIpv(),
        }
      );
    } else {
      throw new Error(
        "Attempted to access /change-security-codes-confirmation without a valid request type"
      );
    }
  };
}

export async function changeSecurityCodesConfirmationPost(
  req: Request,
  res: Response
): Promise<void> {
  req.session.user.accountRecoveryVerifiedMfaType = null;
  const nextPath = await getNextPathAndUpdateJourney(
    req,
    req.path,
    USER_JOURNEY_EVENTS.CHANGE_SECURITY_CODES_COMPLETED,
    null,
    res.locals.sessionId
  );
  res.redirect(nextPath);
}
