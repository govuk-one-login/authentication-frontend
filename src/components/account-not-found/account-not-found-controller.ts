import { Request, Response } from "express";

export function accountNotFoundGet(req: Request, res: Response): void {
  res.render("account-not-found/index.njk", { email: "account.not.found@anymail.com"});
}
