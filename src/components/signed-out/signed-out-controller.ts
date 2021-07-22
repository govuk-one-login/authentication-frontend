import { Request, Response } from "express";

export function signedOutGet(req: Request, res: Response): void {
  if (req.cookies) {
    for (const cookieName of Object.keys(req.cookies)) {
      if (cookieName !== 'lng' && cookieName !== 'cookies_preferences_set' ) {
        res.clearCookie(cookieName);
      }
    }
  }
  res.render("signed-out/index.njk");
}
