import type { Request, Response } from "express";
import { getNextPathAndUpdateJourney } from "../common/state-machine/state-machine-executor.js";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine.js";
import { isAccountRecoveryPermitted } from "../common/account-recovery/account-recovery-helper.js";
import type { AccountRecoveryInterface } from "../common/account-recovery/types.js";
import { accountRecoveryService } from "../common/account-recovery/account-recovery-service.js";
import { isAccountRecoveryJourneyAndPermitted } from "../../utils/request.js";

export function changeSecurityCodesSignInGet(
  req: Request,
  res: Response
): void {
  res.render("change-security-codes-sign-in/index.njk");
}

export function changeSecurityCodesSignInPost(
  acctRecoveryService: AccountRecoveryInterface = accountRecoveryService()
) {
  return async function (req: Request, res: Response): Promise<void> {
    req.session.user.isAccountRecoveryJourney = true;
    req.session.user.isAccountRecoveryPermitted =
      await isAccountRecoveryPermitted(req, res, acctRecoveryService);
    const canRecoverAccount = isAccountRecoveryJourneyAndPermitted(req);

    if (!canRecoverAccount) {
      return res.render("common/errors/generic-error.njk");
    }

    res.redirect(
      await getNextPathAndUpdateJourney(
        req,
        res,
        USER_JOURNEY_EVENTS.START_MFA_RESET
      )
    );
  };
}
