import { body } from "express-validator";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware.js";
import type { ValidationChainFunc } from "../../types.js";
export function validateEnterPasswordRequest(): ValidationChainFunc {
  return [
    body("password")
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t("pages.enterPassword.password.validationError.required", { value });
      }),
    validateBodyMiddleware("enter-password/index.njk"),
  ];
}

export function validateEnterPasswordAccountExistsRequest(): ValidationChainFunc {
  return [
    body("password")
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t(
          "pages.enterPasswordAccountExists.password.validationError.required",
          { value }
        );
      }),
    validateBodyMiddleware("enter-password/index-account-exists.njk", (req) => ({
      email: req.session.user.email,
    })),
  ];
}
