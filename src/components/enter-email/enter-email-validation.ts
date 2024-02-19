import { body } from "express-validator";
import { validateBodyMiddlewareReauthTemplate } from "../../middleware/form-validation-middleware";
import { ValidationChainFunc } from "../../types";
import { RE_ENTER_EMAIL_TEMPLATE } from "./enter-email-controller";

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
      })
      .custom((value, { req }) => {
        if (req.session.user.reauthenticate) {
          return req.t("pages.reEnterEmailAccount.enterYourEmailAddressError", {
            value,
          });
        }
        return true;
      }),
    validateBodyMiddlewareReauthTemplate(RE_ENTER_EMAIL_TEMPLATE, template),
  ];
}
