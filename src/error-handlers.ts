import { NextFunction, Request, Response } from "express";
import { httpStatusCodes } from "./app.constants";
import Logger, { getLogLabel } from "./utils/logger";

const logLabel: string = getLogLabel(__filename);

const pageNotFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (res.headersSent) {
    return next();
  }
  res.status(httpStatusCodes.NOT_FOUND);
  res.render("errors/404.html");
};

const serverErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const logger: Logger = req.app.locals.logger;

  if (err.code === "EBADCSRFTOKEN") {
    if (logger) {
      logger.warn("form tampered with", logLabel, {
        user_agent: req.useragent,
      });
    }

    res.status(httpStatusCodes.INTERNAL_SERVER_ERROR);
    return res.render("errors/500.html");
  }

  if (res.headersSent) {
    return next(err);
  }

  res.status(httpStatusCodes.INTERNAL_SERVER_ERROR);
  res.render("errors/500.html");
};

export { pageNotFoundHandler, serverErrorHandler };
