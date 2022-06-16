import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../../types";
import { MfaServiceInterface } from "./types";
import { getErrorPathByCode, getNextPathAndUpdateJourney } from "../constants";
import { BadRequestError } from "../../../utils/error";
import { USER_JOURNEY_EVENTS } from "../state-machine/state-machine";
import { PATH_NAMES } from "../../../app.constants";
import { sanitize } from "../../../utils/strings";

export function sendMfaGeneric(
  mfaCodeService: MfaServiceInterface
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { email } = req.session.user;
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;

    const result = await mfaCodeService.sendMfaCode(
      sessionId,
      clientSessionId,
      email,
      req.ip,
      persistentSessionId
    );

    if (!result.success) {
      const path = getErrorPathByCode(result.data.code);

      if (path) {
        return res.redirect(path);
      }

      throw new BadRequestError(result.data.message, result.data.code);
    }

    let redirectPath = getNextPathAndUpdateJourney(
      req,
      PATH_NAMES.ENTER_MFA,
      USER_JOURNEY_EVENTS.VERIFY_MFA,
      {
        isLatestTermsAndConditionsAccepted:
          req.session.user.isLatestTermsAndConditionsAccepted,
        isConsentRequired: req.session.user.isConsentRequired,
        isIdentityRequired: req.session.user.isIdentityRequired,
      },
      sessionId
    );

    if (req.query._ga) {
      const queryParams = new URLSearchParams({
        _ga: sanitize(req.query._ga as string),
      }).toString();

      redirectPath = redirectPath + "?" + queryParams;
    }

    return res.redirect(redirectPath);
  };
}
