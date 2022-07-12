import { body } from "express-validator";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware";
import { ValidationChainFunc } from "../../types";

export function validateSetupAuthAppRequest(): ValidationChainFunc {
  return [
    body("code")
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t(
          "pages.setupAuthenticatorApp.code.validationError.required",
          {
            value,
          }
        );
      })
      .isLength({ max: 6 })
      .withMessage((value, { req }) => {
        return req.t(
          "pages.setupAuthenticatorApp.code.validationError.length",
          {
            value,
          }
        );
      }),
    validateBodyMiddleware("setup-authenticator-app/index.njk"),
  ];
}
