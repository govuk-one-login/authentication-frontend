import { body } from "express-validator";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware";

export function validateEnterEmailRequest() {
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
    validateBodyMiddleware("enter-email/index.njk"),
  ];
}
