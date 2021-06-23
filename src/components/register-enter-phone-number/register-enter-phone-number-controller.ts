import { Request, Response } from "express";

export function enterPhoneNumberGet(req: Request, res: Response): void {
  res.render("register-enter-phone-number/index.njk");
}

export function enterPhoneNumberPost(req: Request, res: Response): void {
  res.render("register-enter-phone-number/index.njk");
}
