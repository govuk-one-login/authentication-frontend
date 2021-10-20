import { Request, Response } from "express";

export function cookiesGet(req: Request, res: Response): void {
  res.locals.backUrl = req.get("Referrer");
  res.render("common/cookies/index.njk");
}
