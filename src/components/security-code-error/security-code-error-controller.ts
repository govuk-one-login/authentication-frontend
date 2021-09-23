import { Request, Response } from "express";

export function securityCodeExpiredGet(req: Request, res: Response): void {
  res.render("security-code-error/index.njk");
}

export function securityCodeTriesExceededGet(
  req: Request,
  res: Response
): void {
  res.render("security-code-error/index-too-many-requests.njk");
}

export function securityCodeCannotRequestGet(
  req: Request,
  res: Response
): void {
  res.render("security-code-error/index-wait.njk");
}
