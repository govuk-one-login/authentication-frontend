import { body } from "express-validator";
import { containsNumber } from "../../utils/strings";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware";
import { ValidationChainFunc } from "../../types";
import { isCommonPassword } from "../../utils/password-validation";

export function validateResetPasswordRequest(): ValidationChainFunc {
  return [
    body("password")
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t("pages.resetPassword.password.validationError.required", {
          value,
        });
      })
      .isLength({ min: 8 })
      .withMessage((value, { req }) => {
        return req.t("pages.resetPassword.password.validationError.minLength", {
          value,
        });
      })
      .isLength({ max: 256 })
      .withMessage((value, { req }) => {
        return req.t("pages.resetPassword.password.validationError.maxLength", {
          value,
        });
      })
      .custom((value, { req }) => {
        if (isCommonPassword(value)) {
          throw new Error(
            req.t(
              "pages.createPassword.password.validationError.commonPassword"
            )
          );
        }
        return true;
      })
      .custom((value, { req }) => {
        if (!containsNumber(value)) {
          throw new Error(
            req.t("pages.resetPassword.password.validationError.alphaNumeric")
          );
        }
        return true;
      }),
    body("confirm-password")
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t(
          "pages.resetPassword.confirmPassword.validationError.required",
          { value }
        );
      })
      .custom((value, { req }) => {
        if (value !== req.body["password"]) {
          throw new Error(
            req.t("pages.resetPassword.confirmPassword.validationError.matches")
          );
        }
        return true;
      }),
    validateBodyMiddleware("reset-password/index.njk"),
  ];
}
