import type { ValidationChainFunc } from "../../types.js";
import { body } from "express-validator";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware.js";
import type { Request } from "express";

export function validateCannotSignInPasskeyRequest(): ValidationChainFunc {
  return [
    body("cannot-sign-in-passkey-action")
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t("pages.cannotSignInPasskey.radios.validationError", {
          value,
        });
      }),
    validateBodyMiddleware(
      "cannot-sign-in-passkey/index.njk",
      postValidationLocals
    ),
  ];
}

const postValidationLocals = function locals(
  req: Request
): Record<string, unknown> {
  return {
    authenticationOptions: req.session.user.cannotSignInPasskeyAuthOptions,
    is2FAJourney: req.session.user.isMfaRequired,
  };
};
