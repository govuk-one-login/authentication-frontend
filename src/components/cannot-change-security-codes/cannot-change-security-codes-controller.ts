import { Request, Response } from "express";

export function cannotChangeSecurityCodesGet(
  _req: Request,
  res: Response
): void {
  res.render("cannot-change-security-codes/index.njk");
}
