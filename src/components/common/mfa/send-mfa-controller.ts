import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../../types";
import { MfaServiceInterface } from "./types";
import { getErrorPathByCode, getNextPathAndUpdateJourney } from "../constants";
import { BadRequestError } from "../../../utils/error";
import { USER_JOURNEY_EVENTS } from "../state-machine/state-machine";
import { PATH_NAMES } from "../../../app.constants";
import { sanitize } from "../../../utils/strings";
import xss from "xss";
import { getJourneyTypeFromUserSession } from "../journey/journey";

export function sendMfaGeneric(
  mfaCodeService: MfaServiceInterface
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { email } = req.session.user;
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;
    const isResendCodeRequest: boolean = req.body.isResendCodeRequest;

    const result = await mfaCodeService.sendMfaCode(
      sessionId,
      clientSessionId,
      email,
      req.ip,
      persistentSessionId,
      isResendCodeRequest,
      xss(req.cookies.lng as string),
      req,
      getJourneyTypeFromUserSession(req.session.user, {
        includeReauthentication: true,
      })
    );

    if (!result.success) {
      const path = getErrorPathByCode(result.data.code);

      if (path && isResendCodeRequest) {
        return path.includes("?")
          ? res.redirect(path + "&isResendCodeRequest=true")
          : res.redirect(path + "?isResendCodeRequest=true");
      }

      if (path && !isResendCodeRequest) {
        res.redirect(path);
      }

      throw new BadRequestError(result.data.message, result.data.code);
    }

    let redirectPath;

    if (!isResendCodeRequest) {
      redirectPath = await getNextPathAndUpdateJourney(
        req,
        PATH_NAMES.ENTER_MFA,
        USER_JOURNEY_EVENTS.VERIFY_MFA,
        {
          isLatestTermsAndConditionsAccepted:
            req.session.user.isLatestTermsAndConditionsAccepted,
          isIdentityRequired: req.session.user.isIdentityRequired,
        },
        sessionId
      );
    }

    if (isResendCodeRequest) {
      redirectPath = PATH_NAMES.CHECK_YOUR_PHONE;
    }

    if (req.query._ga) {
      const queryParams = new URLSearchParams({
        _ga: sanitize(req.query._ga as string),
      }).toString();

      redirectPath = redirectPath + "?" + queryParams;
    }

    return res.redirect(redirectPath);
  };
}
