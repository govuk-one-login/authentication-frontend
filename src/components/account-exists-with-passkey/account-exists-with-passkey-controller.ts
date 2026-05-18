import type { Request, Response } from "express";

export function getAccountExistsWithPasskey(req: Request, res: Response): void {
  return res.render("account-exists-with-passkey/index.njk");
}
