import { Request, Response } from "express";
import { BadRequestError } from "../../utils/error";

export function signedOutGet(req: Request, res: Response): void {
  if (req.query && req.query.error_code) {
    throw new BadRequestError(
      req.query.error_description as string,
      req.query.error_code as string
    );
  }

  if (req.cookies) {
    for (const cookieName of Object.keys(req.cookies)) {
      if (cookieName !== "lng" && cookieName !== "cookies_preferences_set") {
        res.clearCookie(cookieName);
      }
    }
  }

  res.render("signed-out/index.njk");
}
