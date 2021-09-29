import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";

import { MfaServiceInterface } from "../common/mfa/types";
import { mfaService } from "../common/mfa/mfa-service";
import { getNextPathByState } from "../common/constants";

export function upliftJourneyGet(
  mfaCodeService: MfaServiceInterface = mfaService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { email } = req.session.user;
    const { sessionId } = res.locals;

    const result = await mfaCodeService.sendMfaCode(sessionId, email, req.ip);
    res.redirect(getNextPathByState(result.sessionState));
  };
}
