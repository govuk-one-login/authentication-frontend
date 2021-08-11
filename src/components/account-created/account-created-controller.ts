import { Request, Response } from "express";
import { PATH_NAMES } from "../../app.constants";

export function registerAccountCreatedGet(req: Request, res: Response): void {
  res.render("account-created/index.njk", { linkUrl: PATH_NAMES.AUTH_CODE });
}
