import type { Request, Response } from "express";
import { BadRequestError } from "../../utils/error.js";
import xss from "xss";

export function signedOutGet(req: Request, res: Response): void {
  const errorCode = xss(req.query.error_code as string);
  const errorDescription = xss(req.query.error_description as string);
  if (errorCode || errorDescription) {
    throw new BadRequestError(errorDescription, errorCode);
  }

  if (req.cookies) {
    for (const cookieName of Object.keys(req.cookies)) {
      if (cookieName !== "lng" && cookieName !== "cookies_preferences_set") {
        res.clearCookie(cookieName);
      }
    }
  }

  if (req.session) {
    req.session.destroy((error) => {
      if (error) {
        req.log.error(`Failed to delete session: ${error}`);
      } else {
        req.log.info("Session destroyed");
      }
    });
  }

  res.render("signed-out/index.njk", {
    signinLink: res.locals.accountManagementUrl,
  });
}
