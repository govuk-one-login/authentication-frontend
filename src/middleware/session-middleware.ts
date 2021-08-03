import { NextFunction, Request, Response } from "express";
import { ERROR_MESSAGES } from "../app.constants";

export function initialiseSessionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  req.session.user = {};
  next();
}

export function getSessionIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.cookies && req.cookies["gs"]) {
    res.locals.sessionId = req.cookies["gs"].split(".")[0];
    res.locals.clientSessionId = req.cookies["gs"].split(".")[1];
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
