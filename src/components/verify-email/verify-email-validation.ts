import { validateBodyMiddleware } from "../../middleware/form-validation-middleware";
import { ValidationChainFunc } from "../../types";
import { validateCode } from "../common/verify-code/verify-code-validation";

export function validateVerifyEmailRequest(): ValidationChainFunc {
  return [
    validateCode({
      requiredKey: "pages.verifyEmail.code.validationError.required",
      maxLengthKey: "pages.verifyEmail.code.validationError.maxLength",
      minLengthKey: "pages.verifyEmail.code.validationError.minLength",
      numbersOnlyKey: "pages.verifyEmail.code.validationError.invalidFormat",
    }),
    validateBodyMiddleware("verify-email/index.njk"),
  ];
}
