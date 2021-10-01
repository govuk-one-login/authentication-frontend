import { NextFunction, Request, Response } from "express";
import { ERROR_MESSAGES } from "../app.constants";

export function initialiseSessionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.cookies || !req.cookies["aps"]) {
    req.session.user = {};
  }

  next();
}

export function getSessionIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.cookies && req.cookies["gs"]) {
    const ids = req.cookies["gs"].split(".");

    res.locals.sessionId = ids[0];
    res.locals.clientSessionId = ids[1];
  }
  next();
}

export function validateSessionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (
    req.cookies["gs"] !== undefined &&
    req.cookies["aps"] !== undefined &&
    res.locals.sessionId
  ) {
    return next();
  }

  res.status(401);
  next(new Error(ERROR_MESSAGES.INVALID_SESSION));
}
