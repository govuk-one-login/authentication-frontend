import { Request, Response } from "express";
import { PATH_NAMES } from "../../app.constants";

export function landingGet(req: Request, res: Response): void {
  res.redirect(PATH_NAMES.SIGN_IN_OR_CREATE);
}
