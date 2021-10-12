import { NextFunction, Request, Response } from "express";
import {
  getAccountManagementUrl,
  getAnalyticsCookieDomain,
  getGtmId,
} from "../config";
import { generateNonce } from "../utils/strings";

export function setLocalVarsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.locals.gtmId = getGtmId();
  res.locals.scriptNonce = generateNonce();
  res.locals.analyticsCookieDomain = getAnalyticsCookieDomain();
  res.locals.accountManagementUrl = getAccountManagementUrl();
  next();
}
