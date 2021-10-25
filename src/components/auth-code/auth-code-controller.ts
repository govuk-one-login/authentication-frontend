import { Request, Response } from "express";
import { getApiBaseUrl } from "../../config";
import { API_ENDPOINTS, COOKIE_CONSENT } from "../../app.constants";
import * as querystring from "querystring";
import xss from "xss";

export function authCodeGet(req: Request, res: Response): void {
  const authCodeRedirect = `${getApiBaseUrl()}${API_ENDPOINTS.AUTH_CODE}`;
  const cookieConsent = xss(req.cookies.cookies_preferences_set);
  let consentValue = COOKIE_CONSENT.NOT_ENGAGED;

  if (cookieConsent) {
    const parsedCookie = JSON.parse(cookieConsent);
    consentValue =
      parsedCookie.analytics === true
        ? COOKIE_CONSENT.ACCEPT
        : COOKIE_CONSENT.REJECT;
  }

  const queryParamCookieConsent = querystring.stringify({
    cookie_consent: consentValue,
  });

  res.redirect(authCodeRedirect + "?" + queryParamCookieConsent);
}
