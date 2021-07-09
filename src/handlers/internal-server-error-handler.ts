import { NextFunction, Request, Response } from "express";
import { HTTP_STATUS_CODES } from "../app.constants";

export function serverErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (res.headersSent) {
    return next(err);
  }

  if (res.statusCode == HTTP_STATUS_CODES.UNAUTHORIZED) {
    return res.render("common/errors/session-expired.njk");
  }

  res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
  res.render("common/errors/500.njk");
}
