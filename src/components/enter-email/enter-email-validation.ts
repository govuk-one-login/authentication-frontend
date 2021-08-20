import { body } from "express-validator";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware";
import { ValidationChainFunc } from "../../types";

export function validateEnterEmailRequest(
  template = "enter-email/enter-email-existing-account.njk"
): ValidationChainFunc {
  return [
    body("email")
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t("pages.enterEmail.email.validationError.required", {
          value,
        });
      })
      .isLength({ max: 256 })
      .withMessage((value, { req }) => {
        return req.t("pages.enterEmail.email.validationError.length", {
          value,
        });
      })
      .isEmail()
      .withMessage((value, { req }) => {
        return req.t("pages.enterEmail.email.validationError.email", { value });
      }),
    validateBodyMiddleware(template),
  ];
}
