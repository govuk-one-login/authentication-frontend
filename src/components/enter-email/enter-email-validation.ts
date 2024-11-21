import { body } from "express-validator";
import { validateBodyMiddlewareReauthTemplate } from "../../middleware/form-validation-middleware";
import { ValidationChainFunc } from "../../types";
import { RE_ENTER_EMAIL_TEMPLATE } from "./enter-email-controller";
import { getChannelSpecificErrorMessage } from "../../utils/get-channel-specific-error-message";
import { WEB_TO_MOBILE_ERROR_MESSAGE_MAPPINGS } from "../../app.constants";

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
      .matches(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~\-]+@([^.@][^@\s]+)$/)
      .withMessage((value, { req }) => {
        return req.t(
          "pages.enterEmailExistingAccount.email.validationError.email",
          { value }
        );
      })
      .custom((value, { req }) => {
        if (req.session.user.reauthenticate) {
          const errorMessage = getChannelSpecificErrorMessage(
            "pages.reEnterEmailAccount.enterYourEmailAddressError",
            req.body.isStrategicAppReauth === "true",
            WEB_TO_MOBILE_ERROR_MESSAGE_MAPPINGS
          );

          return req.t(errorMessage, {
            value,
          });
        }
        return true;
      }),
    validateBodyMiddlewareReauthTemplate(RE_ENTER_EMAIL_TEMPLATE, template),
  ];
}
