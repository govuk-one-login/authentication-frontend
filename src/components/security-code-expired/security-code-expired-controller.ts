import { Request, Response } from "express";

export function securityCodeExpiredGet(req: Request, res: Response): void {
  res.render("security-code-expired/index.njk");
}

export function securityCodeExpiredPost(req: Request, res: Response): void {
  res.redirect("/enter-email");
}
