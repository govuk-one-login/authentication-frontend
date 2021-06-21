import { body } from "express-validator";
import { containsNumber } from "../../utils/strings";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware";

export function validateCreatePasswordRequest() {
  return [
    body("password")
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t("pages.createPassword.password.validationError.required", {
          value,
        });
      })
      .isLength({ min: 8 })
      .withMessage((value, { req }) => {
        return req.t(
          "pages.createPassword.password.validationError.minLength",
          {
            value,
          }
        );
      })
      .isLength({ max: 256 })
      .withMessage((value, { req }) => {
        return req.t(
          "pages.createPassword.password.validationError.maxLength",
          {
            value,
          }
        );
      })
      .custom((value, { req }) => {
        if (!containsNumber(value)) {
          throw new Error(
            req.t("pages.createPassword.password.validationError.alphaNumeric")
          );
        }
        return true;
      }),
    body("confirm-password")
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t(
          "pages.createPassword.confirmPassword.validationError.required",
          { value }
        );
      })
      .custom((value, { req }) => {
        if (value !== req.body["password"]) {
          throw new Error(
            req.t(
              "pages.createPassword.confirmPassword.validationError.matches"
            )
          );
        }
        return true;
      }),
    validateBodyMiddleware("register-create-password/index.njk"),
  ];
}
