import { Request, Response } from "express";
import { COOKIE_CONSENT, PATH_NAMES } from "../../app.constants";
import { getNextPathByState } from "../common/constants";
import xss from "xss";
import * as querystring from "querystring";

const COOKIES_PREFERENCES_SET = "cookies_preferences_set";

function setPreferencesCookie(
  cookieConsent: string,
  res: Response,
  gaId: string
) {
  let cookieValue: any = {};
  const cookieExpires = new Date();

  if ([COOKIE_CONSENT.ACCEPT, COOKIE_CONSENT.REJECT].includes(cookieConsent)) {
    cookieExpires.setFullYear(cookieExpires.getFullYear() + 1);

    cookieValue = {
      analytics: cookieConsent === COOKIE_CONSENT.ACCEPT,
    };

    if (cookieConsent === COOKIE_CONSENT.ACCEPT && gaId) {
      cookieValue.gaId = gaId;
    }
  } else {
    cookieExpires.setFullYear(cookieExpires.getFullYear() - 1);
  }

  res.cookie(COOKIES_PREFERENCES_SET, JSON.stringify(cookieValue), {
    expires: cookieExpires,
    secure: true,
    domain: res.locals.analyticsCookieDomain,
  });
}

export function landingGet(req: Request, res: Response): void {
  let redirectPath = PATH_NAMES.SIGN_IN_OR_CREATE;
  const interrupt = xss(req.query.interrupt as string);
  const ga = xss(req.query._ga as string);

  if (interrupt) {
    redirectPath = getNextPathByState(
      xss(req.query.interrupt as string).trim()
    );
  }

  const cookieConsent = xss(req.query.cookie_consent as string);

  if (cookieConsent) {
    setPreferencesCookie(cookieConsent, res, ga);
    if (ga && cookieConsent === COOKIE_CONSENT.ACCEPT) {
      redirectPath = redirectPath + "?" + querystring.stringify({ _ga: ga });
    }
  }

  res.redirect(redirectPath);
}
