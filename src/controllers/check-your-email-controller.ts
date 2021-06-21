import { Request, Response } from "express";

const ENTER_EMAIL_TEMPLATE = "check-your-email.html";

export function checkYourEmailGet(req: Request, res: Response): void {
  res.render(ENTER_EMAIL_TEMPLATE);
}