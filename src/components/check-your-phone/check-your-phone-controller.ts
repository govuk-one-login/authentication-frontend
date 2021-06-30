import { Request, Response } from "express";

export function checkYourPhoneGet(req: Request, res: Response): void {
  res.render("check-your-phone/index.njk");
}
