import { NextFunction, Request, Response } from "express";
import Logger from "../utils/logger";

export function logErrorMiddleware(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const logger: Logger = req.app.locals.logger;

  const sessionId = req.session.user || undefined;
  const stack = error.stack ? `\n${error.stack}` : "";

  logger.error(
    `[${req.method}] ${req.originalUrl}. error ${error.message}${stack}`,
    "logErrorMiddleware",
    { sessionId }
  );
  next(error);
}
