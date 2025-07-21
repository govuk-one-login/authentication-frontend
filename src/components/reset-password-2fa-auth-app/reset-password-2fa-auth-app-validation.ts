import type { ValidationChainFunc } from "../../types.js";
import { validateCode } from "../common/verify-code/verify-code-validation.js";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware.js";

export function validateResetPassword2faAuthAppRequest(): ValidationChainFunc {
  return [
    validateCode({
      requiredKey:
        "pages.enterAuthenticatorAppCode.code.validationError.required",
      maxLengthKey:
        "pages.enterAuthenticatorAppCode.code.validationError.invalidFormat",
      minLengthKey:
        "pages.enterAuthenticatorAppCode.code.validationError.invalidFormat",
      numbersOnlyKey:
        "pages.enterAuthenticatorAppCode.code.validationError.invalidFormat",
    }),
    validateBodyMiddleware("reset-password-2fa-auth-app/index.njk"),
  ];
}
