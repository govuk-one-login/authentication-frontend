import type { Request, Response } from "express";
import {
  CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION,
  MFA_METHOD_TYPE,
  PATH_NAMES,
} from "../../app.constants.js";
import { needsForcedMFAReset } from "../../utils/request.js";
import { getNextPathAndUpdateJourney } from "../common/state-machine/state-machine-executor.js";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine.js";

export function cannotChangeSecurityCodesGet(
  req: Request,
  res: Response
): void {
  res.render("cannot-change-security-codes/index.njk", {
    formPostPath: req.path,
    identityFailed:
      req.path === PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES_IDENTITY_FAIL,
    onlyDeleteAccount: needsForcedMFAReset(req),
  });
}

export async function cannotChangeSecurityCodesPost(
  req: Request,
  res: Response
): Promise<void> {
  const cannotChangeHowGetSecurityCodeAction =
    req.body.cannotChangeHowGetSecurityCodeAction;

  switch (cannotChangeHowGetSecurityCodeAction) {
    case CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION.HELP_DELETE_ACCOUNT:
      return res.redirect(res.locals.contactUsLinkUrl);
    case CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION.RETRY_SECURITY_CODE:
      return res.redirect(
        await getNextPathAndUpdateJourney(
          req,
          res,
          req.session.user.mfaMethodType === MFA_METHOD_TYPE.SMS
            ? USER_JOURNEY_EVENTS.VERIFY_MFA
            : USER_JOURNEY_EVENTS.VERIFY_AUTH_APP_CODE
        )
      );
    default:
      throw new Error(
        `Invalid cannotChangeHowGetSecurityCodeAction: ${cannotChangeHowGetSecurityCodeAction}`
      );
  }
}