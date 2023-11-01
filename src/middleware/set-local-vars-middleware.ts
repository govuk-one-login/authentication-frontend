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
  res.locals.accountManagementUrl = getAccountManagementUrl();
  res.locals.analyticsCookieDomain = getAnalyticsCookieDomain();
  console.log("isAcctCreation " + req.session?.user?.isAccountCreationJourney);
  res.locals.isAccountRecoveryJourney =
    req.session?.user?.isAccountRecoveryJourney;
  next();
}
