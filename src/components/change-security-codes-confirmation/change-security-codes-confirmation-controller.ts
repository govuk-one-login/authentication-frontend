import { Request, Response } from "express";

export function changeSecurityCodesConfirmationGet(
  _req: Request,
  res: Response
): void {
  res.render("change-security-codes-confirmation/index.njk");
}
