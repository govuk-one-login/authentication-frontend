import { Request, Response } from "express";

export function authCodeGet(req: Request, res: Response): void {
  res.render("auth-code/index.njk");
}
