import type { Request, Response } from "express";

export function temporarilyBlockedGet(req: Request, res: Response): void {
  res.render("account-intervention/temporarily-blocked/index.njk");
}
