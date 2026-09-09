import type { Request, Response } from "express";
import { getJourneyTypeFromUserSession } from "../common/journey/journey.js";
import type { ExpressRouteFunc, SmsMfaMethod } from "../../types.js";
import { supportReauthentication } from "../../config.js";
import { JOURNEY_TYPE, PATH_NAMES } from "../../app.constants.js";
import { isLocked } from "../../utils/lock-helper.js";
import type { MfaServiceInterface } from "../common/mfa/types.js";
import { mfaService } from "../common/mfa/mfa-service.js";
import { sendMfaGeneric } from "../common/mfa/send-mfa-controller.js";

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

export function resetPasswordResendCode2faSmsPost(
  service: MfaServiceInterface = mfaService()
): ExpressRouteFunc {
  return sendMfaGeneric(service, true);
}
