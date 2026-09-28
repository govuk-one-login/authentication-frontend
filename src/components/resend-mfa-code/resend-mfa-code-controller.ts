import type { Request, Response } from "express";
import type { ExpressRouteFunc, SmsMfaMethod } from "../../types.js";
import { mfaService } from "../common/mfa/mfa-service.js";
import type { MfaServiceInterface } from "../common/mfa/types.js";
import { sendMfaGeneric } from "../common/mfa/send-mfa-controller.js";
import { JOURNEY_TYPE, PATH_NAMES } from "../../app.constants.js";
import { supportReauthentication } from "../../config.js";
import { getJourneyTypeFromUserSession } from "../common/journey/journey.js";
import { renderLockoutPageIfLocked } from "../security-code-error/security-code-error-helper.js";

export function resendMfaCodeGet(req: Request, res: Response): void {
  if (renderLockoutPageIfLocked(req, res, PATH_NAMES.RESEND_MFA_CODE)) {
    return;
  }

  const journeyType = getJourneyTypeFromUserSession(req.session.user, {
    includeReauthentication: true,
  });

  const activeMfaMethod = req.session.user.mfaMethods.find(
    (mfaMethod) => mfaMethod.id === req.session.user.activeMfaMethodId
  ) as SmsMfaMethod | undefined;

  res.render("resend-mfa-code/index.njk", {
    redactedPhoneNumber: activeMfaMethod?.redactedPhoneNumber,
    supportReauthentication: supportReauthentication(),
    isReauthJourney: journeyType === JOURNEY_TYPE.REAUTHENTICATION,
  });
}

export function resendMfaCodePost(
  service: MfaServiceInterface = mfaService()
): ExpressRouteFunc {
  return sendMfaGeneric(service, true);
}
