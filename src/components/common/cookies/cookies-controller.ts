import type { Request, Response } from "express";
import { cookieConsentService } from "../cookie-consent/cookie-consent-service.js";
import { sanitize } from "../../../utils/strings.js";
import {
  COOKIES_PREFERENCES_SET,
  COOKIE_CONSENT,
  ANALYTICS_COOKIES,
} from "../../../app.constants.js";
import { getGoogleAnalyticsAndDynatraceCookieDomain } from "../../../config.js";
const cookieService = cookieConsentService();

export function cookiesGet(req: Request, res: Response): void {
  const consentValue = cookieService.getCookieConsent(
    sanitize(req.cookies.cookies_preferences_set)
  );

  res.render("common/cookies/index.njk", {
    originalReferer: sanitize(req.headers.referer),
    analyticsConsent: consentValue.cookie_consent === COOKIE_CONSENT.ACCEPT,
    updated: false,
  });
}

export function cookiesPost(req: Request, res: Response): void {
  const consentValue = req.body.cookie_preferences;
  const consentCookieValue = cookieService.createConsentCookieValue(
    consentValue === "true" ? COOKIE_CONSENT.ACCEPT : COOKIE_CONSENT.REJECT
  );

  if (consentValue === "false") {
    const options = {
      domain: getGoogleAnalyticsAndDynatraceCookieDomain(),
    };

    ANALYTICS_COOKIES.forEach((key) => {
      res.clearCookie(key, options);
    });

    Object.keys(req.cookies).forEach((key) => {
      if (key.startsWith("_ga")) {
        res.clearCookie(key, options);
      }
    });
  }

  res.cookie(COOKIES_PREFERENCES_SET, consentCookieValue.value, {
    expires: consentCookieValue.expires,
    secure: true,
    httpOnly: false,
    domain: res.locals.analyticsCookieDomain,
  });

  res.render("common/cookies/index.njk", {
    originalReferer: sanitize(req.body.originalReferer),
    analyticsConsent: consentValue === "true",
    updated: true,
  });
}
