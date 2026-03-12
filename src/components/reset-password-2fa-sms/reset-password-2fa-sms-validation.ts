import { validateBodyMiddleware } from "../../middleware/form-validation-middleware.js";
import type { ValidationChainFunc } from "../../types.js";
import { validateCode } from "../common/verify-code/verify-code-validation.js";
export function validateResetPassword2faSMSValidation(): ValidationChainFunc {
  return [
    validateCode({
      requiredKey: "pages.checkYourPhone.code.validationError.required",
      maxLengthKey: "pages.checkYourPhone.code.validationError.maxLength",
      minLengthKey: "pages.checkYourPhone.code.validationError.minLength",
      numbersOnlyKey: "pages.checkYourPhone.code.validationError.invalidFormat",
    }),
    validateBodyMiddleware("reset-password-2fa-sms/index.njk"),
  ];
}
