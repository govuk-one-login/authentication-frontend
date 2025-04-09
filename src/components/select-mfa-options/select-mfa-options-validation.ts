import { body } from "express-validator";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware.js";
import { ValidationChainFunc } from "../../types.js";
import { Request } from "express";
import { isAccountRecoveryJourney } from "../../utils/request.js";
export function validateMultiFactorAuthenticationRequest(): ValidationChainFunc {
  return [
    body("mfaOptions")
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t("pages.getSecurityCodes.secondFactorRadios.errorMessage", {
          value,
        });
      }),
    validateBodyMiddleware(
      "select-mfa-options/index.njk",
      postValidationLocals
    ),
  ];
}

const postValidationLocals = function locals(
  req: Request
): Record<string, unknown> {
  return {
    isAccountPartCreated: req.session.user.isAccountPartCreated,
    isAccountRecoveryJourney: isAccountRecoveryJourney(req),
  };
};
