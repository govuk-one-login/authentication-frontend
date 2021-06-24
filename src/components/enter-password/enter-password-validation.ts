import { body } from "express-validator";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware";
import { ValidationChainFunc } from "../../types";

export function validateEnterPasswordRequest(): ValidationChainFunc {
  return [
    body("password")
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t("pages.enterPassword.password.validationError.required", {
          value,
        });
      }),
    validateBodyMiddleware("enter-password/index.njk"),
  ];
}
