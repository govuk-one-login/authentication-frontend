import { NextFunction, Request, Response } from "express";
import { GTM } from "../app.constants";
import {
  googleAnalytics4Disabled,
  universalAnalyticsDisabled,
} from "../config";
export function setGTM(req: Request, res: Response, next: NextFunction): void {
  res.locals.ga4ContainerId = GTM.GA4_CONTAINER_ID;
  res.locals.uaContainerId = GTM.UA_CONTAINER_ID;
  res.locals.analyticsCookieDomain = GTM.ANALYTICS_COOKIE_DOMAIN;
  res.locals.isGa4Disabled = googleAnalytics4Disabled();
  res.locals.isUaDisabled = universalAnalyticsDisabled();
  next();
}
