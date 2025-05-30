import type { NextFunction, Request, Response } from "express";
import { showTestBanner } from "../config.js";
export function environmentBannerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.locals.showTestBanner = showTestBanner();

  next();
}
