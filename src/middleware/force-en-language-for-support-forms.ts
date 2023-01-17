import { NextFunction, Response } from "express";
import { PATH_NAMES } from "../app.constants";

export function forceEnLanguageForSupportForms(
  req: any,
  res: Response,
  next: NextFunction
): void {
  if (typeof req.i18n.changeLanguage === "function") {
    const re = new RegExp(`^${PATH_NAMES.CONTACT_US}`);
    if (re.test(req.url)) {
      req.i18n.changeLanguage("en");
    }
  }
  next();
}
