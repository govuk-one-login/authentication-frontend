import { Request, Response } from "express";
import { getNextPathAndUpdateJourney } from "../common/constants";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";
import { generateMfaSecret } from "../../utils/mfa";
import { MFA_METHOD_TYPE } from "../../app.constants";

const contentIds = {
  createAccount: "95e26313-bc2f-49bc-bc62-fd715476c1d9",
  accountRecovery: "e768e27b-1c4d-48ba-8bcf-4c40274a6441",
};

export function getSecurityCodesGet(req: Request, res: Response): void {
  req.session.user.isAccountCreationJourney =
    !req.session.user.isAccountRecoveryJourney ||
    req.session.user.isAccountPartCreated;

  const isAccountRecoveryJourney = req.session.user.isAccountRecoveryJourney;

  res.render("select-mfa-options/index.njk", {
    isAccountPartCreated: req.session.user.isAccountPartCreated,
    isAccountRecoveryJourney: req.session.user.isAccountRecoveryJourney,
    selectedMfaOption: req.session.user.selectedMfaOption,

    contentId: isAccountRecoveryJourney
      ? contentIds.accountRecovery
      : contentIds.createAccount,
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
      req.path,
      isAuthApp
        ? USER_JOURNEY_EVENTS.MFA_OPTION_AUTH_APP_SELECTED
        : USER_JOURNEY_EVENTS.MFA_OPTION_SMS_SELECTED,
      null,
      res.locals.sessionId
    )
  );
}
