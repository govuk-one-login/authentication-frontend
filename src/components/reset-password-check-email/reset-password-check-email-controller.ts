import { Request, Response } from "express";

export function resetPasswordCheckEmailGet(req: Request, res: Response): void {
  const email = req.session.user.email;
  res.render("reset-password-check-email/index.njk", {
    email,
  });
}
