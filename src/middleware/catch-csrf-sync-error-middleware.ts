import type { NextFunction, Request, Response } from "express";
import { getCSRFCookieOptions } from "../config/cookie.js";
import csurf from "csurf";
import { ENVIRONMENT_NAME } from "../app.constants.js";
import { getNodeEnv } from "../config.js";
import cloneDeep from "lodash.clonedeep";

export function catchCsrfSyncErrorMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const CSRF_MISSING_CODE = "EBADCSRFTOKEN";
  if (err.code === CSRF_MISSING_CODE) {
    req.log.info("Falling back to csurf CSRF validation.");

    const isProduction = getNodeEnv() === ENVIRONMENT_NAME.PROD;

    // Fallback to csurf validation to ensure journeys in progress at the time
    // of deployment do not fail due to csrf errors.
    const csurfHandler = csurf({ cookie: getCSRFCookieOptions(isProduction) });

    // Both csurf and csrf-sync attach a csrfToken function to the request
    // object, there is a race condition to which one is used, with the
    // latter being used in most cases (from testing) as it is attached first.
    // We ideally only want to use the csrf-sync implementation, so we must use
    // a deep copy of the request object.
    const reqClone = cloneDeep(req);

    csurfHandler(reqClone, res, next);
  } else {
    next(err);
  }
}
