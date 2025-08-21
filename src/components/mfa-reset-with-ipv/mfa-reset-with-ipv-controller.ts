import type { MfaResetAuthorizeInterface } from "./types.js";
import { mfaResetAuthorizeService } from "./mfa-reset-authorize-service.js";
import type { ExpressRouteFunc } from "../../types.js";
import type { Request, Response } from "express";
import { BadRequestError } from "../../utils/error.js";
import { getNextPathAndUpdateJourney } from "../common/constants.js";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine.js";
import { MFA_METHOD_TYPE, PATH_NAMES } from "../../app.constants.js";
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

    if (res.locals.isApp) {
      const redirectPath = await getNextPathAndUpdateJourney(
        req,
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
    const backLink =
      req.session.user.mfaMethodType === MFA_METHOD_TYPE.AUTH_APP
        ? PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE
        : PATH_NAMES.ENTER_MFA;
    const template = "mfa-reset-with-ipv/index-open-in-browser-mfa-reset.njk";
    return res.render(template, { backLink });
  };
}
