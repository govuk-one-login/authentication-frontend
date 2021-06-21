import { NextFunction, Request, Response } from "express";
import Logger from "../utils/logger";
import { HTTP_STATUS_CODES } from "../app.constants";

export function timeoutHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const logger: Logger = req.app.locals.logger;

  if (res.headersSent) {
    return next(err);
  }

  if (res.statusCode == HTTP_STATUS_CODES.UNAUTHORIZED) {
    return res.render("common/errors/session-expired.njk");
  }

  next();
}
