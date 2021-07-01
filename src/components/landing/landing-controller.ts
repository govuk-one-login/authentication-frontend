import { Request, Response } from "express";
import { HTTP_STATUS_CODES, PATH_NAMES } from "../../app.constants";

export function landingGet(req: Request, res: Response): void {
  res.redirect(HTTP_STATUS_CODES.REDIRECT, PATH_NAMES.ENTER_EMAIL);
}
