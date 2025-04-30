import { validateBodyMiddleware } from "../../middleware/form-validation-middleware.js";
import type { ValidationChainFunc } from "../../types.js";
import { body } from "express-validator";
import { PATH_NAMES } from "../../app.constants.js";

export function validateHowDoYouWantSecurityCodesRequest(): ValidationChainFunc {
  return [
    body("mfa-method-id")
      .if(body("mfa-method-id").not().equals("true"))
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t("pages.howDoYouWantSecurityCodes.error.empty", {
          value,
        });
      }),
    validateBodyMiddleware(
      "how-do-you-want-security-codes/index.njk",
      (req) => ({
        mfaResetLink: PATH_NAMES.MFA_RESET_WITH_IPV,
        mfaMethods: req.session.user.mfaMethods || [],
      })
    ),
  ];
}
