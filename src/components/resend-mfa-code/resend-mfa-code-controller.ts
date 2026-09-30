import type { Request, Response } from "express";
import type { ExpressRouteFunc, SmsMfaMethod } from "../../types.js";
import { mfaService } from "../common/mfa/mfa-service.js";
import type { MfaServiceInterface } from "../common/mfa/types.js";
import { sendMfaGeneric } from "../common/mfa/send-mfa-controller.js";
import { JOURNEY_TYPE, PATH_NAMES } from "../../app.constants.js";
import { pathWithQueryParam } from "../common/constants.js";
import { supportReauthentication } from "../../config.js";
import { isLocked } from "../../utils/lock-helper.js";
import { getJourneyTypeFromUserSession } from "../common/journey/journey.js";

export function resendMfaCodeGet(req: Request, res: Response): void {
  if (isLocked(req.session.user.wrongCodeEnteredLock)) {
    const newCodeLink = req.query?.isResendCodeRequest
      ? pathWithQueryParam(
          PATH_NAMES.RESEND_MFA_CODE,
          "isResendCodeRequest",
          "true"
        )
      : PATH_NAMES.RESEND_MFA_CODE;
    res.render("security-code-error/index-security-code-entered-exceeded.njk", {
      newCodeLink: newCodeLink,
      isAuthApp: false,
      show2HrScreen:
        req.session.user.isSignInJourney &&
        !req.session.user.isAccountRecoveryJourney,
    });
  } else if (isLocked(req.session.user.codeRequestLock)) {
    const newCodeLink = req.query?.isResendCodeRequest
      ? "/resend-code?isResendCodeRequest=true"
      : "/resend-code";
    res.render("security-code-error/index-wait.njk", {
      newCodeLink,
    });
  } else {
    const journeyType = getJourneyTypeFromUserSession(req.session.user, {
      includeReauthentication: true,
    });

    const activeMfaMethod = req.session.user.mfaMethods.find(
      (mfaMethod) => mfaMethod.id === req.session.user.activeMfaMethodId
    ) as SmsMfaMethod | undefined;

    res.render("resend-mfa-code/index.njk", {
      redactedPhoneNumber: activeMfaMethod?.redactedPhoneNumber,
      isResendCodeRequest: req.query?.isResendCodeRequest,
      supportReauthentication: supportReauthentication(),
      isReauthJourney: journeyType === JOURNEY_TYPE.REAUTHENTICATION,
    });
  }
}

export function resendMfaCodePost(
  service: MfaServiceInterface = mfaService()
): ExpressRouteFunc {
  return sendMfaGeneric(service);
}
