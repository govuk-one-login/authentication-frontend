import { Request, Response } from "express";
import { check } from "express-validator";

export function enterPasswordValidationSchema() {
  return [
    check("password")
      .trim()
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t("pages.enterPassword.password.validationError.required", {
          value,
        });
      }),
  ];
}

export function enterPasswordGet(req: Request, res: Response): void {
  res.render("enter-password.html");
}

export function enterPasswordPost(req: Request, res: Response): void {
  res.render("enter-code.html");
}
