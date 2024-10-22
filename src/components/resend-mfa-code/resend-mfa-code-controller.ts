import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import { mfaService } from "../common/mfa/mfa-service";
import { MfaServiceInterface } from "../common/mfa/types";
import { sendMfaGeneric } from "../common/mfa/send-mfa-controller";
import { JOURNEY_TYPE, PATH_NAMES } from "../../app.constants";
import { pathWithQueryParam } from "../common/constants";
import { support2hrLockout, supportReauthentication } from "../../config";
import { isLocked } from "../../utils/lock-helper";
import { getJourneyTypeFromUserSession } from "../common/journey/journey";

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

    res.render("resend-mfa-code/index.njk", {
      redactedPhoneNumber: req.session.user.redactedPhoneNumber,
      isResendCodeRequest: req.query?.isResendCodeRequest,
      support2hrLockout: support2hrLockout(),
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
