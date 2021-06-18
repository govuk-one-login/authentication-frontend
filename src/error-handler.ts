import { NextFunction, Request, Response } from "express";
import { ERROR_MESSAGES, HTTP_STATUS_CODES } from "./app.constants";
import Logger, { getLogLabel } from "./utils/logger";
import { isSessionValid } from "./utils/session";
import { UserSession } from "./types/user-session";

const logLabel: string = getLogLabel(__filename);

function getSessionId(session: UserSession) {
  return isSessionValid(session) ? session.id : undefined;
}

export function pageNotFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (res.headersSent) {
    return next();
  }
  const logger: Logger = req.app.locals.logger;
  if (logger) {
    logger.warn(ERROR_MESSAGES.PAGE_NOT_FOUND, logLabel, {
      sessionId: getSessionId(req.session.user),
    });
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
      logger.warn(ERROR_MESSAGES.INVALID_CSRF_TOKEN, logLabel, {
        sessionId: getSessionId(req.session.user),
        userAgent: req.useragent,
      });
    }

    res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
    return res.render("errors/500.html");
  }

  if (res.headersSent) {
    return next(err);
  }

  logger.error(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, logLabel, {
    sessionId: getSessionId(req.session.user),
    userAgent: req.useragent,
  });

  if (res.statusCode == HTTP_STATUS_CODES.UNAUTHORIZED) {
    return res.render("errors/session-expired.html");
  }

  res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
  res.render("errors/500.html");
}
