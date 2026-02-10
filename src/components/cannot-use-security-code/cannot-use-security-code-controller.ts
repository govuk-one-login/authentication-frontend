import type { Request, Response } from "express";

export function cannotUseSecurityCodeGet(req: Request, res: Response): void {
  return res.render("cannot-use-security-code/index.njk");
}
