import type { ValidationChainFunc } from "../../types.js";
import { body } from "express-validator";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware.js";

export function validateCannotSignInPasskeyRequest(): ValidationChainFunc {
  return [
    body("cannot-sign-in-passkey-action")
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t("pages.cannotSignInPasskey.radios.validationError", {
          value,
        });
      }),
    validateBodyMiddleware("cannot-sign-in-passkey/index.njk"),
  ];
}
