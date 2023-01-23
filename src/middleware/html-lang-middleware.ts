import { NextFunction, Request, Response } from "express";
import { PATH_NAMES } from "../app.constants";

export function setHtmlLangMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.i18n) {
    const re = new RegExp(`^${PATH_NAMES.CONTACT_US}`);
    res.locals.htmlLang = re.test(req.url) ? "en" : req.i18n.language;
  }
  next();
}
