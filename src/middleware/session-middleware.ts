import { NextFunction, Request, Response } from "express";
import { createSession, isSessionValid } from "../utils/session";
import { ERROR_MESSAGES } from "../app.constants";

export function createSessionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (
    Object.keys(req.query).length > 0 &&
    req.query["session-id"] &&
    req.query.scope
  ) {
    req.session.user = createSession(req.query["session-id"], req.query.scope);
  }

  next();
}

export function validateSessionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (isSessionValid(req.session.user)) {
    return next();
  }

  res.status(401);
  next(new Error(ERROR_MESSAGES.INVALID_SESSION));
}
