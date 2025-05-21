import { validateBodyMiddleware } from "../../middleware/form-validation-middleware.js";
import type { ValidationChainFunc } from "../../types.js";
import { validateCode } from "../common/verify-code/verify-code-validation.js";
import { resetPasswordCheckEmailTemplateParametersFromRequest } from "./reset-password-check-email-controller.js";

export function validateResetPasswordCheckEmailRequest(): ValidationChainFunc {
  return [
    validateCode({
      requiredKey:
        "pages.resetPasswordCheckEmail.code.validationError.required",
      maxLengthKey:
        "pages.resetPasswordCheckEmail.code.validationError.maxLength",
      minLengthKey:
        "pages.resetPasswordCheckEmail.code.validationError.minLength",
      numbersOnlyKey:
        "pages.resetPasswordCheckEmail.code.validationError.invalidFormat",
    }),
    validateBodyMiddleware(
      "reset-password-check-email/index.njk",
      resetPasswordCheckEmailTemplateParametersFromRequest
    ),
  ];
}
