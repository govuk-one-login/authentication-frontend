import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import { mfaService } from "../common/mfa/mfa-service";
import { MfaServiceInterface } from "../common/mfa/types";
import { sendMfaGeneric } from "../common/mfa/send-mfa-controller";
import { support2hrLockout } from "../../config";

export function resendMfaCodeGet(req: Request, res: Response): void {
  res.render("resend-mfa-code/index.njk", {
    phoneNumber: req.session.user.redactedPhoneNumber,
    isResendCodeRequest: req.query?.isResendCodeRequest,
    support2hrLockout: support2hrLockout(),
  });
}

export function resendMfaCodePost(
  service: MfaServiceInterface = mfaService()
): ExpressRouteFunc {
  return sendMfaGeneric(service);
}
