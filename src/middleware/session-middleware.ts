import { NextFunction, Request, Response } from "express";
import { ERROR_MESSAGES, PATH_NAMES } from "../app.constants";
import { getNextPathByState } from "../components/common/constants";
import xss from "xss";

export function initialiseSessionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.query.interrupt) {
    req.session.resetMaxAge();
  } else {
    req.session.regenerate((err: any) => {
      if (err) {
        throw new Error(err);
      }
    });
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

  req.session.destroy();

  res.status(401);
  next(new Error(ERROR_MESSAGES.INVALID_SESSION));
}

export function handleBackButtonMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { backState } = req.session;

  if (backState) {
    const nextPath = getNextPathByState(backState);

    if (req.route.path !== nextPath) {
      req.session.backState = null;
      return res.redirect(PATH_NAMES.INVALID_SESSION);
    }
  }

  return next();
}
