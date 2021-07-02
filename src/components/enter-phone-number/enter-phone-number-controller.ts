import { Request, Response } from "express";
import { PATH_NAMES } from "../../app.constants";

export function enterPhoneNumberGet(req: Request, res: Response): void {
  res.render("enter-phone-number/index.njk");
}

export function enterPhoneNumberPost(req: Request, res: Response): void {
  res.redirect(PATH_NAMES.CHECK_YOUR_PHONE);
}
