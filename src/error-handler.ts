import { NextFunction, Request, Response } from "express";
import { ERROR_MESSAGES, HTTP_STATUS_CODES } from "./app.constants";
import Logger, { getLogLabel } from "./utils/logger";

const logLabel: string = getLogLabel(__filename);

export function pageNotFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (res.headersSent) {
    return next();
  }

  res.status(HTTP_STATUS_CODES.NOT_FOUND);
  res.render("errors/404.html");
}

export function serverErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const logger: Logger = req.app.locals.logger;

  if (err.code === "EBADCSRFTOKEN") {
    if (logger) {
      logger.warn(ERROR_MESSAGES.INVALID_CSRF_TOKEN, logLabel, {});
    }

    res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
    return res.render("errors/500.html");
  }

  if (res.headersSent) {
    return next(err);
  }

  logger.error(err, logLabel, {});

  res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
  res.render("errors/500.html");
}
