import { Request, Response } from "express";

export function browserBackButtonErrorGet(req: Request, res: Response): void {
  res.render("browser-back-button-error/index.njk");
}
