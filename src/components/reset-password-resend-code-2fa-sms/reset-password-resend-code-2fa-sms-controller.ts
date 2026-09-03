import type { Request, Response } from "express";
import { getJourneyTypeFromUserSession } from "../common/journey/journey.js";
import type { SmsMfaMethod } from "../../types.js";
import { supportReauthentication } from "../../config.js";
import { JOURNEY_TYPE } from "../../app.constants.js";

export function resetPasswordResendCode2faSmsGet(
  req: Request,
  res: Response
): void {
  // TODO wrongCodeEnteredLock
  // TODO coeRequestLock

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
