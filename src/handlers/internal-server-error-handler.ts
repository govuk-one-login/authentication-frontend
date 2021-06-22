import { NextFunction, Request, Response } from "express";
import Logger, { getLogLabel } from "../utils/logger";
import { ERROR_MESSAGES, HTTP_STATUS_CODES } from "../app.constants";
import { UserSession } from "../types";
import { isSessionValid } from "../utils/session";

const logLabel: string = getLogLabel(__filename);

function getSessionId(session: UserSession) {
  return isSessionValid(session) ? session.id : undefined;
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
    return res.render("common/errors/500.njk");
  }

  if (res.headersSent) {
    return next(err);
  }

  res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
  res.render("common/errors/500.njk");
}
