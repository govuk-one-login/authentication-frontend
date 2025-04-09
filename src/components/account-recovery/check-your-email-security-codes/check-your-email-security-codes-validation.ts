import { validateBodyMiddleware } from "../../../middleware/form-validation-middleware.js";
import type { ValidationChainFunc } from "../../../types.js";
import { validateCode } from "../../common/verify-code/verify-code-validation.js";
export function validateCheckYourEmailRequest(): ValidationChainFunc {
  return [
    validateCode({
      requiredKey:
        "pages.checkYourEmailSecurityCodes.code.validationError.required",
      maxLengthKey:
        "pages.checkYourEmailSecurityCodes.code.validationError.maxLength",
      minLengthKey:
        "pages.checkYourEmailSecurityCodes.code.validationError.minLength",
      numbersOnlyKey:
        "pages.checkYourEmailSecurityCodes.code.validationError.invalidFormat",
    }),
    validateBodyMiddleware(
      "account-recovery/check-your-email-security-codes/index.njk"
    ),
  ];
}
