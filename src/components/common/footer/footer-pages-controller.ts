import { Request, Response } from "express";

export function privacyStatementGet(req: Request, res: Response): void {
  res.render("common/footer/privacy-statement.njk");
}

export function termsConditionsGet(req: Request, res: Response): void {
  res.render("common/footer/terms-conditions.njk");
}

export function accessibilityStatementGet(req: Request, res: Response): void {
  res.render("common/footer/accessibility-statement.njk");
}
