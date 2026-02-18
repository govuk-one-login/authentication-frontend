import type { Request, Response } from "express";

export function changeSecurityCodesSignInGet(
  req: Request,
  res: Response
): void {
  res.render("change-security-codes-sign-in/index.njk");
}

export function changeSecurityCodesSignInPost(
  req: Request,
  res: Response
): void {
  res.status(200).send();
}
