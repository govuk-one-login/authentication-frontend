import { validateBodyMiddlewareUpliftTemplate } from "../../middleware/form-validation-middleware.js";
import type { ValidationChainFunc } from "../../types.js";
import { validateCode } from "../common/verify-code/verify-code-validation.js";
import {
  ENTER_AUTH_APP_CODE_DEFAULT_TEMPLATE_NAME,
  enterAuthenticatorAppCodeTemplateParametersFromRequest,
  UPLIFT_REQUIRED_AUTH_APP_TEMPLATE_NAME,
} from "./enter-authenticator-app-code-controller.js";
export function validateEnterAuthenticatorAppCodeRequest(): ValidationChainFunc {
  return [
    validateCode({
      requiredKey: "pages.enterAuthenticatorAppCode.code.validationError.required",
      maxLengthKey: "pages.enterAuthenticatorAppCode.code.validationError.invalidFormat",
      minLengthKey: "pages.enterAuthenticatorAppCode.code.validationError.invalidFormat",
      numbersOnlyKey:
        "pages.enterAuthenticatorAppCode.code.validationError.invalidFormat",
    }),
    validateBodyMiddlewareUpliftTemplate(
      UPLIFT_REQUIRED_AUTH_APP_TEMPLATE_NAME,
      ENTER_AUTH_APP_CODE_DEFAULT_TEMPLATE_NAME,
      enterAuthenticatorAppCodeTemplateParametersFromRequest
    ),
  ];
}
