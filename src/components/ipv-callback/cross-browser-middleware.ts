import { sessionIsValid } from "../../middleware/session-middleware";
import { NextFunction, Request, Response } from "express";
import { CrossBrowserService } from "./cross-browser-service";
import { ExpressRouteFunc } from "../../types";

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
        await crossBrowserService.getOrchestrationRedirectUrl(req);
      return res.redirect(orchestrationRedirectUrl);
    }
    next();
  };
};
