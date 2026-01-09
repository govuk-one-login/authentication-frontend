import type { Request, Response } from "express";
import { getNextPathAndUpdateJourney } from "../common/state-machine/state-machine-executor.js";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine.js";
import { generateMfaSecret } from "../../utils/mfa.js";
import { MFA_METHOD_TYPE } from "../../app.constants.js";
import { isAccountRecoveryJourney } from "../../utils/request.js";
import { supportNewInternationalSms } from "../../config.js";

export function getSecurityCodesGet(req: Request, res: Response): void {
  const accountRecoveryJourney = isAccountRecoveryJourney(req);
  req.session.user.isAccountCreationJourney =
    !accountRecoveryJourney || req.session.user.isAccountPartCreated;

  res.render("select-mfa-options/index.njk", {
    isAccountPartCreated: req.session.user.isAccountPartCreated,
    isAccountRecoveryJourney: accountRecoveryJourney,
    selectedMfaOption: req.session.user.selectedMfaOption,
    supportNewInternationalSms: supportNewInternationalSms(),
  });
}

export async function getSecurityCodesPost(
  req: Request,
  res: Response
): Promise<void> {
  if (Object.values(MFA_METHOD_TYPE).includes(req.body.mfaOptions)) {
    req.session.user.selectedMfaOption = req.body.mfaOptions;
  }

  const isAuthApp = req.body.mfaOptions === "AUTH_APP";

  if (isAuthApp) {
    req.session.user.authAppSecret = generateMfaSecret();
  }

  res.redirect(
    await getNextPathAndUpdateJourney(
      req,
      res,
      isAuthApp
        ? USER_JOURNEY_EVENTS.MFA_OPTION_AUTH_APP_SELECTED
        : USER_JOURNEY_EVENTS.MFA_OPTION_SMS_SELECTED
    )
  );
}
