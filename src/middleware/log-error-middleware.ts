import { NextFunction, Request, Response } from "express";

export function logErrorMiddleware(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const sessionId = req.session.user || undefined;
  const stack = error.stack ? `\n${error.stack}` : "";

  req.log.error(`[${req.method}] ${req.originalUrl}. ${stack}`, { sessionId });
  next(error);
}
