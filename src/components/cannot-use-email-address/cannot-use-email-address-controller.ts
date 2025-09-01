import type { Request, Response } from "express";

export function cannotUseEmailAddressGet(req: Request, res: Response): void {
  return res.render("cannot-use-email-address/index.njk")
}