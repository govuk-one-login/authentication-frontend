import { Request, Response } from "express";

export function privacyStatementGet(req: Request, res: Response): void {
  res.render("privacy-statement.njk");
}

export function termsConditionsGet(req: Request, res: Response): void {
  res.render("terms-conditions.njk");
}

export function accessibilityStatementGet(req: Request, res: Response): void {
  res.render("accessibility-statement.njk");
}
