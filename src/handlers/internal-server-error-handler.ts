import type { NextFunction, Request, Response } from "express";
import { getAccountManagementUrl } from "../config.js";
import { ERROR_MESSAGES, HTTP_STATUS_CODES } from "../app.constants.js";
export function serverErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (res.headersSent) {
    return next(err);
  }

  if (
    (res.statusCode == HTTP_STATUS_CODES.UNAUTHORIZED &&
      err.message ===
        ERROR_MESSAGES.INVALID_SESSION_NON_GOV_UK_EXTERNAL_REQUEST) ||
    res.statusCode == HTTP_STATUS_CODES.FORBIDDEN
  ) {
    return res.render("common/errors/mid-journey-direct-navigation.njk", {
      accountManagementUrl: getAccountManagementUrl(),
    });
  }

  if (res.statusCode == HTTP_STATUS_CODES.UNAUTHORIZED) {
    return res.render("common/errors/session-expired.njk");
  }

  res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
  res.render("common/errors/500.njk");
}
