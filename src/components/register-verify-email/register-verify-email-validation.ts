import { body } from "express-validator";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware";

export function validateVerifyEmailRequest() {
  return [
    body("code")
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t("pages.verifyEmail.code.validationError.required", {
          value,
        });
      })
      .isLength({ max: 6 })
      .withMessage((value, { req }) => {
        return req.t("pages.verifyEmail.code.validationError.maxLength", {
          value,
        });
      })
      .isLength({ min: 6 })
      .withMessage((value, { req }) => {
        return req.t("pages.verifyEmail.code.validationError.minLength", {
          value,
        });
      }),
    validateBodyMiddleware("register-verify-email/index.njk"),
  ];
}
