import { Request, Response } from "express";
import { COOKIE_CONSENT, PATH_NAMES } from "../../app.constants";
import { getNextPathByState } from "../common/constants";

const COOKIES_PREFERENCES_SET = "cookies_preferences_set";

function setPreferencesCookie(cookieConsent: string, res: Response) {
  if ([COOKIE_CONSENT.ACCEPT, COOKIE_CONSENT.REJECT].includes(cookieConsent)) {
    const yearFromNow = new Date();
    yearFromNow.setFullYear(yearFromNow.getFullYear() + 1);

    res.cookie(
      COOKIES_PREFERENCES_SET,
      JSON.stringify({ analytics: cookieConsent === COOKIE_CONSENT.ACCEPT }),
      {
        expires: yearFromNow,
        secure: true,
      }
    );
  } else {
    const expiredDate = new Date();
    expiredDate.setFullYear(expiredDate.getFullYear() - 1);
    res.cookie(COOKIES_PREFERENCES_SET, "", {
      expires: expiredDate,
      secure: true,
    });
  }
}

export function landingGet(req: Request, res: Response): void {
  let redirectPath = PATH_NAMES.SIGN_IN_OR_CREATE;

  if (req.query.interrupt) {
    redirectPath = getNextPathByState((req.query.interrupt as string).trim());
  }

  const cookieConsent = req.query.cookie_consent as string;

  if (!cookieConsent) {
    return res.redirect(redirectPath);
  }

  setPreferencesCookie(cookieConsent, res);

  res.redirect(redirectPath);
}
