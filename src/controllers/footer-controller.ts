import { Request, Response } from "express";

export const privacyStatementGet = (req: Request, res: Response): void => {
  res.render("privacy-statement.html");
};

export const termsConditionsGet = (req: Request, res: Response): void => {
  res.render("terms-conditions.html");
};

export const accessibilityStatementGet = (req: Request, res: Response): void => {
  res.render("accessibility-statement.html");
};
