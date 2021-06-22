import { Request, Response } from "express";

export function registerVerifyEmailGet(req: Request, res: Response): void {
  res.render("register-verify-email/index.njk");
}

export function registerVerifyEmailPost(req: Request, res: Response): void {
  res.render("register-verify-email.njk");
}
