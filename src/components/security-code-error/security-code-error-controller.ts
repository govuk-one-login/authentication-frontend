import { Request, Response } from "express";

export function securityCodeInvalidGet(req: Request, res: Response): void {
  res.render("security-code-error/index.njk");
}

export function securityCodeTriesExceededGet(
  req: Request,
  res: Response
): void {
  res.render("security-code-error/index-too-many-requests.njk");
}

export function securityCodeCannotRequestCodeGet(
  req: Request,
  res: Response
): void {
  res.render("security-code-error/index-wait.njk");
}
