import type { Request, Response } from "express";
import { PATH_NAMES } from "../../app.constants.js";
import { isAccountRecoveryPermitted } from "../common/account-recovery/account-recovery-helper.js";
import type { AccountRecoveryInterface } from "../common/account-recovery/types.js";
import { accountRecoveryService } from "../common/account-recovery/account-recovery-service.js";
import type { ExpressRouteFunc } from "../../types.js";
import { isAccountRecoveryJourneyAndPermitted } from "../../utils/request.js";

export function cannotUseSecurityCodeGet(
  acctRecoveryService: AccountRecoveryInterface = accountRecoveryService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    req.session.user.needsForcedMFAReset = true;
    req.session.user.isAccountRecoveryJourney = true;
    req.session.user.isAccountRecoveryPermitted =
      await isAccountRecoveryPermitted(req, res, acctRecoveryService);
    const canRecoverAccount = isAccountRecoveryJourneyAndPermitted(req);

    if (!canRecoverAccount) {
      return res.render("common/errors/generic-error.njk");
    }

    return res.render("cannot-use-security-code/index.njk", {
      changeSecurityCodesLink: PATH_NAMES.MFA_RESET_WITH_IPV,
    });
  };
}
