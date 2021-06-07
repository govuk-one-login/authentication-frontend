import { Request, Response } from "express";

const enterPasswordGet = (req: Request, res: Response): void => {
  res.render("enter-password.html");
};

const enterPasswordPost = (req: Request, res: Response): void => {
  res.render("enter-code.html");
};

export { enterPasswordGet, enterPasswordPost };
