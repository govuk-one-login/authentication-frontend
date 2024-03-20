import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import { rpAuthCodeService } from "./rp-auth-code-service";
import { RpAuthCodeServiceInterface } from "./types";
import { BadRequestError } from "../../utils/error";
import { CookieConsentServiceInterface } from "../common/cookie-consent/types";
import { cookieConsentService } from "../common/cookie-consent/cookie-consent-service";
import { sanitize } from "../../utils/strings";
import { COOKIE_CONSENT } from "../../app.constants";

export function rpAuthCodeGet(
  service: RpAuthCodeServiceInterface = rpAuthCodeService(),
  cookieService: CookieConsentServiceInterface = cookieConsentService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;
    const gaId = req.session.client.crossDomainGaTrackingId;

    const result = await service.getAuthCode(
      sessionId,
      clientSessionId,
      req.ip,
      persistentSessionId
    );

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
