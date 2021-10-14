import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import { mfaService } from "../common/mfa/mfa-service";
import { MfaServiceInterface } from "../common/mfa/types";
import { getNextPathByState } from "../common/constants";
import { BadRequestError } from "../../utils/error";

export function resendMfaCodeGet(req: Request, res: Response): void {
  res.render("resend-mfa-code/index.njk", {
    phoneNumber: req.session.phoneNumber,
  });
}

export function resendMfaCodePost(
  service: MfaServiceInterface = mfaService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { email } = req.session;
    const id = res.locals.sessionId;
    const clientSessionId = res.locals.clientSessionId;

    const result = await service.sendMfaCode(id, clientSessionId, email, req.ip);

    if (!result.success && !result.sessionState) {
      throw new BadRequestError(result.message, result.code);
    }

    return res.redirect(getNextPathByState(result.sessionState));
  };
}
