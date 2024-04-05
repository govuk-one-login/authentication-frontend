import { NextFunction, Request, Response } from "express";
import { GTM } from "../app.constants";
export function setGTM(req: Request, res: Response, next: NextFunction): void {
  res.locals.ga4ContainerId = GTM.GA4_CONTAINER_ID;
  res.locals.uaContainerId = GTM.UA_CONTAINER_ID;
  res.locals.analyticsCookieDomain = GTM.ANALYTICS_COOKIE_DOMAIN;
  res.locals.isGa4Disabled = GTM.GA4_DISABLED === "true";
  res.locals.isUaDisabled = GTM.UA_DISABLED === "true";
  next();
}
