import type { Request, Response } from "express";
import { getJourneyTypeFromUserSession } from "../common/journey/journey.js";
import type { SmsMfaMethod } from "../../types.js";
import { supportReauthentication } from "../../config.js";
import { JOURNEY_TYPE, PATH_NAMES } from "../../app.constants.js";
import { isLocked } from "../../utils/lock-helper.js";

export function resetPasswordResendCode2faSmsGet(
  req: Request,
  res: Response
): void {
  if (isLocked(req.session.user.wrongCodeEnteredLock)) {
    res.render("security-code-error/index-security-code-entered-exceeded.njk", {
      newCodeLink: PATH_NAMES.RESET_PASSWORD_RESEND_CODE_2FA_SMS,
      isAuthApp: false,
      show2HrScreen:
        req.session.user.isSignInJourney &&
        !req.session.user.isAccountRecoveryJourney,
    });
  } else if (isLocked(req.session.user.codeRequestLock)) {
    res.render("security-code-error/index-wait.njk");
  } else {
    const journeyType = getJourneyTypeFromUserSession(req.session.user, {
      includeReauthentication: true,
    });

    const activeMfaMethod = req.session.user.mfaMethods.find(
      (mfaMethod) => mfaMethod.id === req.session.user.activeMfaMethodId
    ) as SmsMfaMethod | undefined;

    res.render("reset-password-resend-code-2fa-sms/index.njk", {
      redactedPhoneNumber: activeMfaMethod?.redactedPhoneNumber,
      supportReauthentication: supportReauthentication(),
      isReauthJourney: journeyType === JOURNEY_TYPE.REAUTHENTICATION,
    });
  }
}
