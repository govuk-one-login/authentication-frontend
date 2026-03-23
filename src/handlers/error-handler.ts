import type { NextFunction, Request, Response } from "express";
import { getAccountManagementUrl } from "../config.js";
import { ERROR_MESSAGES, HTTP_STATUS_CODES } from "../app.constants.js";
import { BadRequestError } from "../utils/error.js";
import { ERROR_CODES } from "../components/common/constants.js";

export function errorHandler(
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

  if (
    err instanceof BadRequestError &&
    err.code === ERROR_CODES.INDEFINITELY_BLOCKED_INTERNATIONAL_SMS.toString()
  ) {
    res.status(HTTP_STATUS_CODES.OK);
    return res.render("common/errors/generic-error.njk");
  }

  if (
    err instanceof BadRequestError &&
    err.code === ERROR_CODES.SESSION_ID_MISSING_OR_INVALID.toString()
  ) {
    res.status(HTTP_STATUS_CODES.BAD_REQUEST);
    return res.render("common/errors/generic-error.njk");
  }

  if (err instanceof BadRequestError) {
    res.status(HTTP_STATUS_CODES.BAD_REQUEST);
    return res.render("common/errors/generic-error.njk");
  }

  res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
  res.render("common/errors/generic-error.njk");
}
