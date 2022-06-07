import { NextFunction, Request, Response } from "express";
import { createServiceRedirectErrorUrl } from "../utils/error";
import { IPV_ERROR_CODES, OIDC_ERRORS } from "../app.constants";
import { addSecondsToDate } from "../utils/date";

export function processIdentityRateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const initialRequestStart = req.session.user.identityProcessCheckStart;
  const now = new Date();
  if (initialRequestStart) {
    if (now.getTime() > initialRequestStart) {
      return res.redirect(
        createServiceRedirectErrorUrl(
          req.session.client.redirectUri,
          OIDC_ERRORS.ACCESS_DENIED,
          IPV_ERROR_CODES.IDENTITY_PROCESSING_TIMEOUT
        )
      );
    }
  } else {
    req.session.user.identityProcessCheckStart = addSecondsToDate(60);
  }

  next();
}
