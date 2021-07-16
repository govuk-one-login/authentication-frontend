import { NextFunction, Request, Response } from "express";
import { createSession, isSessionValid } from "../utils/session";
import { ERROR_MESSAGES } from "../app.constants";

export function createSessionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const id = req.query["id"];
  const scope = req.query.scope;
  if (Object.keys(req.query).length > 0 && id && scope) {
    req.session.user = createSession(id as string, scope as string);
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

  res.clearCookie("aps");
  res.clearCookie("aps.sig");
  res.status(401);
  next(new Error(ERROR_MESSAGES.INVALID_SESSION));
}
