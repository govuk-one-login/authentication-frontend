import { NextFunction, Request, Response } from "express";
import {
  getAnalyticsCookieDomain,
  getGA4ContainerId,
  getGTMContainerID,
  googleAnalytics4Disabled,
  universalAnalyticsDisabled,
} from "../config";
export function setGTM(req: Request, res: Response, next: NextFunction): void {
  res.locals.ga4ContainerId = getGA4ContainerId();
  res.locals.uaContainerId = getGTMContainerID();
  res.locals.analyticsCookieDomain = getAnalyticsCookieDomain();
  res.locals.isGa4Disabled = googleAnalytics4Disabled();
  res.locals.isUaDisabled = universalAnalyticsDisabled();
  next();
}
