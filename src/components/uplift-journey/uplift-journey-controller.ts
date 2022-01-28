import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";

import { MfaServiceInterface } from "../common/mfa/types";
import { mfaService } from "../common/mfa/mfa-service";
import { getNextPathByState } from "../common/constants";

export function upliftJourneyGet(
  mfaCodeService: MfaServiceInterface = mfaService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { email } = req.session;
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;

    const result = await mfaCodeService.sendMfaCode(
      sessionId,
      clientSessionId,
      email,
      req.ip,
      persistentSessionId
    );

    let redirectPath = getNextPathByState(result.sessionState);

    if (req.query._ga) {
      const queryParams = new URLSearchParams({
        _ga: req.query._ga as string,
      }).toString();

      redirectPath = redirectPath + "?" + queryParams;
    }

    res.redirect(redirectPath);
  };
}
