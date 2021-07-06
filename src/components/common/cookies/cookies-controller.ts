import { Request, Response } from "express";

export function cookiesGet(req: Request, res: Response): void {
  res.render("common/cookies/index.njk");
}
