import type { Request, Response } from "express";
import { getNextPathAndUpdateJourney } from "../common/state-machine/state-machine-executor.js";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine.js";
import {
  CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION,
  MFA_METHOD_TYPE,
} from "../../app.constants.js";

export function cannotChangeSecurityCodesNoIdentityGet(
  req: Request,
  res: Response
): void {
  res.render("cannot-change-security-codes-no-identity/index.njk");
}

export async function cannotChangeSecurityCodesNoIdentityPost(
  req: Request,
  res: Response
): Promise<void> {
  const action = req.body.cannotChangeHowGetSecurityCodeAction;
  const mfaMethodType = req.session.user.mfaMethodType;
  let userJourneyEvent;
  if (
    action ===
    CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION.INITIATE_SELF_SERVE_ACCOUNT_DELETION
  ) {
    userJourneyEvent = USER_JOURNEY_EVENTS.INITIATE_SELF_SERVE_ACCOUNT_DELETION;
  } else if (
    action === CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION.RETRY_SECURITY_CODE
  ) {
    if (mfaMethodType === MFA_METHOD_TYPE.SMS) {
      userJourneyEvent = USER_JOURNEY_EVENTS.VERIFY_MFA;
    } else if (mfaMethodType === MFA_METHOD_TYPE.AUTH_APP) {
      userJourneyEvent = USER_JOURNEY_EVENTS.VERIFY_AUTH_APP_CODE;
    } else {
      throw new Error(`Invalid mfaMethodType: ${mfaMethodType}`);
    }
  } else {
    throw new Error(`Invalid cannotChangeHowGetSecurityCodeAction: ${action}`);
  }
  return res.redirect(
    await getNextPathAndUpdateJourney(req, res, userJourneyEvent)
  );
}
