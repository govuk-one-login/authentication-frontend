import { body } from "express-validator";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware";
import { ValidationChainFunc } from "../../types";

export function validateEnterEmailRequest(
  template = "enter-email/index-existing-account.njk"
): ValidationChainFunc {
  return [
    body("email")
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t(
          "pages.enterEmailExistingAccount.email.validationError.required",
          {
            value,
          }
        );
      })
      .isLength({ max: 256 })
      .withMessage((value, { req }) => {
        return req.t(
          "pages.enterEmailExistingAccount.email.validationError.length",
          {
            value,
          }
        );
      })
      .isEmail({ ignore_max_length: true })
      .withMessage((value, { req }) => {
        return req.t(
          "pages.enterEmailExistingAccount.email.validationError.email",
          { value }
        );
      })
      /* eslint-disable-next-line */
      .matches(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~\-]+@([^.@][^@\s]+)$/)
      .withMessage((value, { req }) => {
        return req.t(
          "pages.enterEmailExistingAccount.email.validationError.email",
          { value }
        );
      }),
    validateBodyMiddleware(template),
  ];
}
