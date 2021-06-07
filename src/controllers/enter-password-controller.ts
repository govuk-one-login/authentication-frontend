import { Request, Response } from "express";

export function enterPasswordGet(req: Request, res: Response): void {
  res.render("enter-password.html");
}

export function enterPasswordPost(req: Request, res: Response): void {
  res.render("enter-code.html");
}
