import type { Request, Response } from "express";

export function accountDeletedGet(req: Request, res: Response): void {
  res.render("account-deleted/index.njk");
}
