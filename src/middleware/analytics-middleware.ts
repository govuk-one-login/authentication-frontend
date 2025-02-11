import { NextFunction, Request, Response } from "express";
import {
  getAnalyticsCookieDomain,
  getGA4ContainerId,
  googleAnalytics4Enabled,
} from "../config";
export function setGTM(req: Request, res: Response, next: NextFunction): void {
  res.locals.ga4ContainerId = getGA4ContainerId();
  res.locals.analyticsCookieDomain = getAnalyticsCookieDomain();
  res.locals.isGa4Enabled = googleAnalytics4Enabled();
  next();
}
