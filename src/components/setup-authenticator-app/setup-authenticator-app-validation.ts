import { body } from "express-validator";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware";
import { ValidationChainFunc } from "../../types";
import { Request } from "express";
import {
  containsNumbersOnly,
  splitSecretKeyIntoFragments,
} from "../../utils/strings";

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
      .isLength({ min: 6, max: 6 })
      .withMessage((value, { req }) => {
        return req.t(
          "pages.setupAuthenticatorApp.code.validationError.invalidFormat",
          {
            value,
          }
        );
      })
      .custom((value, { req }) => {
        if (!containsNumbersOnly(value)) {
          throw new Error(
            req.t(
              "pages.setupAuthenticatorApp.code.validationError.invalidFormat"
            )
          );
        }
        return true;
      }),
    validateBodyMiddleware(
      "setup-authenticator-app/index.njk",
      postValidationLocals
    ),
  ];
}

const postValidationLocals = function locals(
  req: Request
): Record<string, unknown> {
  return {
    qrCode: req.session.user.authAppQrCodeUrl,
    secretKeyFragmentArray: splitSecretKeyIntoFragments(
      req.session.user.authAppSecret
    ),
  };
};
