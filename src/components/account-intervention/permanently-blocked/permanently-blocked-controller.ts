import type { Request, Response } from "express";

export function permanentlyBlockedGet(req: Request, res: Response): void {
  res.render("account-intervention/permanently-blocked/index.njk");
}
