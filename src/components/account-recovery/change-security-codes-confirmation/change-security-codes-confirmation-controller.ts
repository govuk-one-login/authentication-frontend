import type { Request, Response } from "express";
import { MFA_METHOD_TYPE } from "../../../app.constants.js";
import type { ExpressRouteFunc } from "../../../types.js";
import { USER_JOURNEY_EVENTS } from "../../common/state-machine/state-machine.js";
import { getNextPathAndUpdateJourney } from "src/components/common/state-machine/state-machine-executor.js";
import { getDefaultSmsMfaMethod } from "../../../utils/mfa.js";

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
    res,
    USER_JOURNEY_EVENTS.CHANGE_SECURITY_CODES_COMPLETED
  );
  res.redirect(nextPath);
}
