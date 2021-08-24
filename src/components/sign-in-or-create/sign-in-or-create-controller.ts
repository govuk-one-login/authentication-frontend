import { Request, Response } from "express";

export function signInOrCreateGet(req: Request, res: Response): void {
  res.render("sign-in-or-create/index.njk");
}

export function signInOrCreatePost(req: Request, res: Response): void {

  req.session.user.createAccount = req.body.createAccount === 'true';

  res.redirect("/enter-email");
}
