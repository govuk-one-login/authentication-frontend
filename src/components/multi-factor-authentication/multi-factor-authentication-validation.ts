import { body } from "express-validator";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware";
import { ValidationChainFunc } from "../../types";

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
      "multi-factor-authentication/get-security-codes.njk"
    ),
  ];
}
