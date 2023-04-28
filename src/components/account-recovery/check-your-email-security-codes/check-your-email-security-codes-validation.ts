import { validateBodyMiddleware } from "../../../middleware/form-validation-middleware";
import { ValidationChainFunc } from "../../../types";
import { validateCode } from "../../common/verify-code/verify-code-validation";

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
    validateBodyMiddleware("check-your-email/index.njk"),
  ];
}
