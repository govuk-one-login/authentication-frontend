import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import { PATH_NAMES } from "../../app.constants";
import { mfaService } from "../common/mfa/mfa-service";
import { MfaServiceInterface } from "../common/mfa/types";

export function resendMfaCodeGet(req: Request, res: Response): void {
  res.render("resend-mfa-code/index.njk", {
    phoneNumber: req.session.user.phoneNumber,
  });
}

export function resendMfaCodePost(
  service: MfaServiceInterface = mfaService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { email } = req.session.user;
    const id = res.locals.sessionId;
    await service.sendMfaCode(id, email);
    res.redirect(PATH_NAMES.ENTER_MFA);
  };
}
