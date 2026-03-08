import { sessionIsValid } from "../../middleware/session-middleware.js";
import type { NextFunction, Request, Response } from "express";
import type { CrossBrowserService } from "./cross-browser-service.js";
import type { ExpressRouteFunc } from "../../types.js";
export const crossBrowserMiddleware = (
  crossBrowserService: CrossBrowserService
): ExpressRouteFunc => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!sessionIsValid(req) && crossBrowserService.isCrossBrowserIssue(req)) {
      const orchestrationRedirectUrl =
        await crossBrowserService.getOrchestrationRedirectUrl(req, res);
      return res.redirect(orchestrationRedirectUrl);
    }
    next();
  };
};
