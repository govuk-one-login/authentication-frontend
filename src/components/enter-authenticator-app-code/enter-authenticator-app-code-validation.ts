import { validateBodyMiddleware } from "../../middleware/form-validation-middleware";
import { ValidationChainFunc } from "../../types";
import { validateCode } from "../common/verify-code/verify-code-validation";

export function validateEnterAuthenticatorAppCodeRequest(): ValidationChainFunc {
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
    validateBodyMiddleware("enter-authenticator-app-code/index.njk"),
  ];
}
