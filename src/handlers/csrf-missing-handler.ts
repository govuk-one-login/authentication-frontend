import type { NextFunction, Request, Response } from "express";
import { sessionIsValid } from "../middleware/session-middleware.js";
import { CSRF_MISSING_CODE, HTTP_STATUS_CODES } from "../app.constants.js";

export function csrfMissingHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err.code === CSRF_MISSING_CODE) {
    res.status(HTTP_STATUS_CODES.FORBIDDEN);

    if (sessionIsValid(req)) {
      req.log.error(
        "Invalid or missing CSRF token, but session is valid. Redirecting to 'internal server error' page."
      );

      return res.render("common/errors/generic-error.njk");
    } else {
      req.log.warn(
        "Session has expired - unable to validate CSRF token if present in request body. Redirecting to 'session expired' error page."
      );

      return res.render("common/errors/session-expired.njk", {
        strategicAppChannel: res.locals.strategicAppChannel,
      });
    }
  }

  next(err);
}
