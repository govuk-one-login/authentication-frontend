import type { Request, Response } from "express";

export function accountExistsWithPasskeyGet(req: Request, res: Response): void {
  const { email } = req.session.user;
  res.render("account-exists-with-passkey/index.njk", {
    email: email,
  });
}
