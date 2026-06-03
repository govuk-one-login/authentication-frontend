import type { Request, Response } from "express";

export function cannotSignInPasskeyGet(req: Request, res: Response): void {
  return res.render("cannot-sign-in-passkey/index.njk");
}
