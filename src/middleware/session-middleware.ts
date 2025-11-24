import type { NextFunction, Request, Response } from "express";
import xss from "xss";
import { ErrorWithLevel } from "../utils/error.js";
import { getAppEnv } from "../config.js";
import {
  ERROR_LOG_LEVEL,
  ERROR_MESSAGES,
  HTTP_STATUS_CODES,
  PATH_NAMES,
} from "../app.constants.js";
import type { MfaMethod } from "../types.js";
import { MfaMethodPriority } from "../types.js";

export function initialiseSessionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.path === PATH_NAMES.AUTHORIZE) {
    req.session.client = {};

    req.session.user = {
      email: req.session?.user?.email,
      mfaMethods: req.session?.user?.mfaMethods,
      activeMfaMethodId: req.session?.user?.mfaMethods?.find(
        (method: MfaMethod) => method.priority === MfaMethodPriority.DEFAULT
      )?.id,
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
  if (req.session?.client?.rpClientId) {
    res.locals.clientId = req.session.client.rpClientId;
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
  } else {
    return handleSessionError(req, res, next);
  }
}

export function requiredSessionFieldsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.session?.user?.email) {
    req.log.info("required session field 'email' is missing");
    return handleSessionError(req, res, next);
  } else {
    return next();
  }
}

function handleSessionError(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  req.session.destroy((error) => {
    if (error) {
      req.log.error(`Failed to delete session: ${error}`);
    } else {
      req.log.info("Session destroyed");
    }
  });

  res.status(HTTP_STATUS_CODES.UNAUTHORIZED);

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
