import { MfaResetAuthorizeInterface } from "./types";
import { mfaResetAuthorizeService } from "./mfa-reset-authorize-service";
import { ExpressRouteFunc } from "../../types";
import { Request, Response } from "express";
import { BadRequestError } from "../../utils/error";
import { getNextPathAndUpdateJourney } from "../common/constants";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";

export function mfaResetWithIpvGet(
  service: MfaResetAuthorizeInterface = mfaResetAuthorizeService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { email, isAccountRecoveryPermitted } = req.session.user;
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;

    if (isAccountRecoveryPermitted === false) {
      throw new Error(
        "User started IPV reverification journey without being permitted. This should be replaced with an appropriate error page"
      );
    }

    if (res.locals.strategicAppChannel === true) {
      const redirectPath = await getNextPathAndUpdateJourney(
        req,
        req.path,
        USER_JOURNEY_EVENTS.MFA_RESET_ATTEMPTED_VIA_AUTH_APP,
        {},
        res.locals.sessionId
      );
      return res.redirect(redirectPath);
    }

    req.session.user.isAccountRecoveryJourney = true;

    const orchestrationRedirectUrl = req.session.client.redirectUri.concat(
      "?state=",
      req.session.client.state
    );
    const result = await service.ipvRedirectUrl(
      sessionId,
      clientSessionId,
      persistentSessionId,
      req,
      email,
      orchestrationRedirectUrl
    );

    if (!result.success) {
      throw new BadRequestError(result.data.message, result.data.code);
    }

    await getNextPathAndUpdateJourney(
      req,
      req.path,
      USER_JOURNEY_EVENTS.IPV_REVERIFICATION_INIT,
      null,
      sessionId
    );

    const ipvCoreURL = result.data.authorize_url;

    res.redirect(ipvCoreURL);
  };
}

export function mfaResetOpenInBrowserGet(): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const template = "mfa-reset-with-ipv/index-open-in-browser-mfa-reset.njk";
    return res.render(template);
  };
}
