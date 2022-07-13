import { Request, Response } from "express";
import { cookieConsentService } from "../cookie-consent/cookie-consent-service";
import { sanitize } from "../../../utils/strings";
import {
  COOKIES_PREFERENCES_SET,
  COOKIE_CONSENT,
} from "../../../app.constants";
import { CookieConsentModel } from "../cookie-consent/types";

const cookieService = cookieConsentService();

export function cookiesGet(req: Request, res: Response): void {
  const consentValue = cookieService.getCookieConsent(
    sanitize(req.cookies.cookies_preferences_set)
  );

  res.locals.backUrl = req.headers.referer;
  res.locals.analyticsConsent =
    consentValue.cookie_consent === COOKIE_CONSENT.ACCEPT;
  res.locals.updated = false;
  res.render("common/cookies/index.njk");
}

export function cookiesPost(req: Request, res: Response): void {
  const consentValue = req.body.cookie_preferences;
  const consentCookieValue = cookieService.createConsentCookieValue(
    consentValue === "true" ? COOKIE_CONSENT.ACCEPT : COOKIE_CONSENT.REJECT
  );

  createConsentCookie(res, consentCookieValue);

  res.locals.backUrl = req.body.originalReferer;
  res.locals.analyticsConsent = consentValue === "true";
  res.locals.updated = true;
  res.render("common/cookies/index.njk");
}

function createConsentCookie(
  res: Response,
  consentCookieValue: CookieConsentModel
) {
  res.cookie(COOKIES_PREFERENCES_SET, consentCookieValue.value, {
    expires: consentCookieValue.expiry,
    secure: true,
    domain: res.locals.analyticsCookieDomain,
  });
}
