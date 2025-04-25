import { Request, Response } from "express";

export function howDoYouWantSecurityCodesGet(
  req: Request,
  res: Response
): void {
  res.render("how-do-you-want-security-codes/index.njk");
}
