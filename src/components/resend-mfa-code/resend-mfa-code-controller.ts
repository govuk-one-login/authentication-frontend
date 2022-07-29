import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import { mfaService } from "../common/mfa/mfa-service";
import { MfaServiceInterface } from "../common/mfa/types";
import { sendMfaGeneric } from "../common/mfa/send-mfa-controller";

export function resendMfaCodeGet(req: Request, res: Response): void {
  const isStillLockedOutBy15MinOtpCodeBlockWindow = req.cookies?.re;

  if (isStillLockedOutBy15MinOtpCodeBlockWindow) {
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
