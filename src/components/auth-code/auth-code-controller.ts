import type { Request, Response } from "express";
import type { ExpressRouteFunc } from "../../types.js";
import { authCodeService } from "./auth-code-service.js";
import type { AuthCodeServiceInterface } from "./types.js";
import { BadRequestError } from "../../utils/error.js";
import type { CookieConsentServiceInterface } from "../common/cookie-consent/types.js";
import { cookieConsentService } from "../common/cookie-consent/cookie-consent-service.js";
import { sanitize } from "../../utils/strings.js";
import { COOKIE_CONSENT } from "../../app.constants.js";
export function authCodeGet(
  service: AuthCodeServiceInterface = authCodeService(),
  cookieService: CookieConsentServiceInterface = cookieConsentService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;
    const gaId = req.session.client.crossDomainGaTrackingId;

    const result = await service.getAuthCode(
      sessionId,
      clientSessionId,
      persistentSessionId,
      req.session.client,
      req.session.user,
      req
    );

    delete req.session.user.reauthenticate;

    if (!result.success) {
      throw new BadRequestError(result.data.message, result.data.code);
    }

    let authCodeLocation = result.data.location;

    if (req.session.client.cookieConsentEnabled) {
      const consentValue = cookieService.getCookieConsent(
        sanitize(req.cookies.cookies_preferences_set)
      );

      const queryParams = new URLSearchParams({
        cookie_consent: consentValue.cookie_consent,
      });

      if (gaId && consentValue.cookie_consent === COOKIE_CONSENT.ACCEPT) {
        queryParams.append("_ga", gaId);
      }

      authCodeLocation = authCodeLocation + "&" + queryParams.toString();
    }

    res.redirect(authCodeLocation);
  };
}
