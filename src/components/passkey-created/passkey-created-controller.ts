import type { Request, Response } from "express";

export function passkeyCreatedGet(req: Request, res: Response): void {
  res.render("passkey-created/index.njk");
}
