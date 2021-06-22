import { Request, Response } from "express";

export function registerAccountCreatedGet(req: Request, res: Response): void {
  res.render("register-account-created/index.njk");
}

export function registerAccountCreatedPost(req: Request, res: Response): void {}
