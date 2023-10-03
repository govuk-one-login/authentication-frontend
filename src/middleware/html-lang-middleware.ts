import { NextFunction, Request, Response } from "express";
import { PATH_NAMES } from "../app.constants";
import { supportWelshInSupportForms } from "../config";

export function setHtmlLangMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.i18n) {
    if (forceEnglishLanguageInSupportForms(req, supportWelshInSupportForms())) {
      res.locals.htmlLang = "en";
    } else {
      res.locals.htmlLang = req.i18n.language;
    }
  }
  next();
}

export function isSupportForm(req: Request): boolean {
  const re = new RegExp(`^${PATH_NAMES.CONTACT_US}`);
  return re.test(req.url);
}

export function forceEnglishLanguageInSupportForms(
  req: Request,
  supportWelsh: boolean
): boolean {
  return isSupportForm(req) && !supportWelsh;
}
