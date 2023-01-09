import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import { mfaService } from "../common/mfa/mfa-service";
import { MfaServiceInterface } from "../common/mfa/types";
import { sendMfaGeneric } from "../common/mfa/send-mfa-controller";
import { PATH_NAMES } from "../../app.constants";

export function resendMfaCodeGet(req: Request, res: Response): void {
  if (
    req.session.user.wrongCodeEnteredLock &&
    new Date().toUTCString() < req.session.user.wrongCodeEnteredLock
  ) {
    res.render("security-code-error/index-security-code-entered-exceeded.njk", {
      newCodeLink: PATH_NAMES.RESEND_MFA_CODE,
      isAuthApp: false,
    });
  } else if (
    req.session.user.codeRequestLock &&
    new Date().toUTCString() < req.session.user.codeRequestLock
  ) {
    const newCodeLink = req.query?.isResendCodeRequest
      ? "/resend-code?isResendCodeRequest=true"
      : "/resend-code";
    res.render("security-code-error/index-wait.njk", {
      newCodeLink,
    });
  } else {
    res.render("resend-mfa-code/index.njk", {
      phoneNumber: req.session.user.phoneNumber,
      isResendCodeRequest: req.query?.isResendCodeRequest,
    });
  }
}

export function resendMfaCodePost(
  service: MfaServiceInterface = mfaService()
): ExpressRouteFunc {
  return sendMfaGeneric(service);
}
