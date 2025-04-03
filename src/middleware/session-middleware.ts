import { NextFunction, Request, Response } from "express";
import xss from "xss";
import { ErrorWithLevel } from "../utils/error";
import { getAppEnv } from "../config";
import { ERROR_LOG_LEVEL, ERROR_MESSAGES, PATH_NAMES } from "../app.constants";

export function initialiseSessionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.path === PATH_NAMES.AUTHORIZE) {
    req.session.client = {};

    const email =
      req.session && req.session.user ? req.session.user.email : undefined;
    const redactedPhoneNumber =
      req.session && req.session.user
        ? req.session.user.redactedPhoneNumber
        : undefined;

    const phoneNumber =
      req.session && req.session.user
        ? req.session.user.phoneNumber
        : undefined;

    req.session.user = {
      email: email,
      redactedPhoneNumber: redactedPhoneNumber,
      phoneNumber: phoneNumber,
    };

    req.session.sessionRestored = true;
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

export function sessionIsValid(req: Request): boolean {
  return !!(
    req.cookies?.gs &&
    req.cookies?.aps &&
    req.session?.id &&
    req.session?.sessionRestored
  );
}

export function validateSessionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (sessionIsValid(req)) {
    return next();
  }

  req.session.destroy((error) => {
    if (error) {
      req.log.error(`Failed to delete session: ${error}`);
    } else {
      req.log.info("Session destroyed");
    }
  });

  res.status(401);

  const referrer = req.get("Referrer");
  const isReferrerInternal =
    getAppEnv() === "local"
      ? referrer?.includes("localhost")
      : referrer?.includes("gov.uk");

  if (isReferrerInternal) {
    req.log.info("request from gov.uk domain");
    return next(
      new ErrorWithLevel(
        ERROR_MESSAGES.INVALID_SESSION_GOV_UK_INTERNAL_REQUEST,
        ERROR_LOG_LEVEL.INFO
      )
    );
  }

  return next(
    new ErrorWithLevel(
      ERROR_MESSAGES.INVALID_SESSION_NON_GOV_UK_EXTERNAL_REQUEST,
      ERROR_LOG_LEVEL.INFO
    )
  );
}
