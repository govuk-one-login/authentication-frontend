import { NextFunction, Request, Response } from "express";
import { ERROR_MESSAGES, PATH_NAMES } from "../app.constants";
import xss from "xss";

export function initialiseSessionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.path === PATH_NAMES.START) {
    if (req.session.user && req.session.user.isAuthenticated) {
      req.session.resetMaxAge();
    } else {
      req.session.client = {};
      req.session.user = {};
    }
  }

  next();
}

export function getSessionIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.cookies && req.cookies.gs) {
    const ids = xss(req.cookies["gs"]).split(".");

    res.locals.sessionId = ids[0];
    res.locals.clientSessionId = ids[1];
  }
  if (req.cookies && req.cookies["di-persistent-session-id"]) {
    res.locals.persistentSessionId = xss(
      req.cookies["di-persistent-session-id"]
    );
  }
  next();
}

export function validateSessionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.cookies.gs && req.cookies.aps && req.session.id) {
    return next();
  }

  req.session.destroy((error) => {
    throw Error(`Unable to destroy session ${error}`);
  });

  res.status(401);
  next(new Error(ERROR_MESSAGES.INVALID_SESSION));
}
