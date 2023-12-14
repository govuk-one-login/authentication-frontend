import { validateBodyMiddleware } from "../../middleware/form-validation-middleware";
import { ValidationChainFunc } from "../../types";
import {
  validateCode,
  whitespaceSanitizer,
} from "../common/verify-code/verify-code-validation";

export function validateCheckYourEmailRequest(): ValidationChainFunc {
  return [
    whitespaceSanitizer(),
    validateCode({
      requiredKey: "pages.checkYourEmail.code.validationError.required",
      maxLengthKey: "pages.checkYourEmail.code.validationError.maxLength",
      minLengthKey: "pages.checkYourEmail.code.validationError.minLength",
      numbersOnlyKey: "pages.checkYourEmail.code.validationError.invalidFormat",
    }),
    validateBodyMiddleware("check-your-email/index.njk"),
  ];
}
