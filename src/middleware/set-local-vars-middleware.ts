import { NextFunction, Request, Response } from "express";
import {
  getAccountManagementUrl,
  getAnalyticsCookieDomain,
  getLanguageToggleEnabled,
} from "../config.js";
import { generateNonce } from "../utils/strings.js";
export async function setLocalVarsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  res.locals.scriptNonce = await generateNonce();
  res.locals.accountManagementUrl = getAccountManagementUrl();
  res.locals.analyticsCookieDomain = getAnalyticsCookieDomain();
  res.locals.languageToggleEnabled = getLanguageToggleEnabled();
  next();
}
