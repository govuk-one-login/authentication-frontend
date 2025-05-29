import { body } from "express-validator";
import { containsNumber, containsNumbersOnly } from "../../utils/strings.js";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware.js";
import type { ValidationChainFunc } from "../../types.js";
import type { Request } from "express";

export function validateResetPasswordRequest(): ValidationChainFunc {
  return [
    body("password")
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t("pages.resetPassword.password.validationError.required", { value });
      })
      .isLength({ max: 256 })
      .withMessage((value, { req }) => {
        return req.t("pages.resetPassword.password.validationError.maxLength", { value });
      })
      .custom((value, { req }) => {
        if (!containsNumber(value) || containsNumbersOnly(value) || value.length < 8) {
          throw new Error(
            req.t("pages.resetPassword.password.validationError.alphaNumeric")
          );
        }
        return true;
      }),
    body("confirm-password")
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t("pages.resetPassword.confirmPassword.validationError.required", {
          value,
        });
      })
      .custom((value, { req }) => {
        if (value !== req.body["password"]) {
          throw new Error(
            req.t("pages.resetPassword.confirmPassword.validationError.matches")
          );
        }
        return true;
      }),
    validateBodyMiddleware("reset-password/index.njk", postValidationLocals),
  ];
}

const postValidationLocals = function locals(req: Request): Record<string, unknown> {
  return { isPasswordChangeRequired: req.session.user.isPasswordChangeRequired };
};
