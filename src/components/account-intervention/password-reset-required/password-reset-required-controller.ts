import { Request, Response } from "express";

export function passwordResetRequiredGet(req: Request, res: Response): void {
  res.render("account-intervention/password-reset-required/index.njk");
}
