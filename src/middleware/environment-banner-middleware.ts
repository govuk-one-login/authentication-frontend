import { NextFunction, Request, Response } from "express";
import { showTestBanner } from "../config";

export function environmentBannerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.locals.showTestBanner = showTestBanner();

  next();
}
