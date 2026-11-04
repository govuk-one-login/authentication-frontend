import { body } from "express-validator";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware.js";
import type { ValidationChainFunc } from "../../types.js";
import { CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION } from "../../app.constants.js";

export function validateCannotChangeSecurityCodesNoIdentityRequest(): ValidationChainFunc {
  return [
    body("cannotChangeHowGetSecurityCodeAction")
      .isIn([
        CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION.INITIATE_SELF_SERVE_ACCOUNT_DELETION,
        CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION.RETRY_SECURITY_CODE,
      ])
      .withMessage((value, { req }) => {
        return req.t(
          "pages.cannotChangeSecurityCodesNoIdentity.radios.radioValidationError",
          { value }
        );
      }),
    validateBodyMiddleware(
      "cannot-change-security-codes-no-identity/index.njk"
    ),
  ];
}
