import { Request, Response } from "express";

export function signedOutGet(req: Request, res: Response): void {
  res.render("signed-out/index.njk");
}
