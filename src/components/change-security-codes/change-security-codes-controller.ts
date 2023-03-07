import { Request, Response } from "express";
import { PATH_NAMES } from "../../app.constants";

export function changeSecurityCodesGet(_req: Request, res: Response): void {
  res.redirect(PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES);
}
