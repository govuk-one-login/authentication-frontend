import { Request, Response } from "express";
import { body } from "express-validator";
import { validateBodyMiddleware } from "../middleware/form-validation-middleware";

const ENTER_PASSWORD_TEMPLATE_NAME = "enter-password.html";

export function validateEnterPasswordRequest() {
  return [
    body("password")
      .trim()
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t("pages.enterPassword.password.validationError.required", {
          value,
        });
      }),
    validateBodyMiddleware(ENTER_PASSWORD_TEMPLATE_NAME),
  ];
}

export function enterPasswordGet(req: Request, res: Response): void {
  res.render(ENTER_PASSWORD_TEMPLATE_NAME);
}

export function enterPasswordPost(req: Request, res: Response): void {
  res.render("enter-code.html");
}