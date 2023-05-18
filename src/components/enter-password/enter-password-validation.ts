import { body } from "express-validator";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware";
import { ValidationChainFunc } from "../../types";
import { Request } from "express";

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

export function validateEnterPasswordAccountExistsRequest(): ValidationChainFunc {
  return [
    body("password")
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t(
          "pages.enterPasswordAccountExists.password.validationError.required",
          {
            value,
          }
        );
      }),
    validateBodyMiddleware(
      "enter-password/index-account-exists.njk",
      postValidationLocals
    ),
  ];
}

const postValidationLocals = function locals(
  req: Request
): Record<string, unknown> {
  return {
    email: req.session.user.email,
  };
};
