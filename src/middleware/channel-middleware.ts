import { NextFunction, Request, Response } from "express";
import { CHANNEL } from "../app.constants";

export function channelMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.locals.strategicAppChannel =
    req.session?.user?.channel === CHANNEL.STRATEGIC_APP;
  res.locals.webChannel = req.session?.user?.channel === CHANNEL.WEB;
  next();
}
