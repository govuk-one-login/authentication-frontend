import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import { mfaService } from "../common/mfa/mfa-service";
import { MfaServiceInterface } from "../common/mfa/types";
import { sendMfaGeneric } from "../common/mfa/send-mfa-controller";
import { PATH_NAMES } from "../../app.constants";
import { pathWithQueryParam } from "../common/constants";
import { support2hrLockout } from "../../config";

export function resendMfaCodeGet(req: Request, res: Response): void {
  if (
    req.session.user.wrongCodeEnteredLock &&
    new Date().getTime() <
      new Date(req.session.user.wrongCodeEnteredLock).getTime()
  ) {
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
      contentId: "4",
      taxonomyLevel2: "4"
    });
  } else if (
    req.session.user.codeRequestLock &&
    new Date().getTime() < new Date(req.session.user.codeRequestLock).getTime()
  ) {
    const newCodeLink = req.query?.isResendCodeRequest
      ? "/resend-code?isResendCodeRequest=true"
      : "/resend-code";
    res.render("security-code-error/index-wait.njk", {
      newCodeLink,
    });
  } else {
    res.render("resend-mfa-code/index.njk", {
      phoneNumber: req.session.user.redactedPhoneNumber,
      isResendCodeRequest: req.query?.isResendCodeRequest,
      support2hrLockout: support2hrLockout(),
    });
  }
}

export function resendMfaCodePost(
  service: MfaServiceInterface = mfaService()
): ExpressRouteFunc {
  return sendMfaGeneric(service);
}
