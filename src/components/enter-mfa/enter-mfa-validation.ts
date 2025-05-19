import { validateBodyMiddlewareUpliftTemplate } from "../../middleware/form-validation-middleware.js";
import type { ValidationChainFunc } from "../../types.js";
import { validateCode } from "../common/verify-code/verify-code-validation.js";
import {
  ENTER_MFA_DEFAULT_TEMPLATE_NAME,
  enterMfaTemplateParametersFromRequest,
  UPLIFT_REQUIRED_SMS_TEMPLATE_NAME,
} from "./enter-mfa-controller.js";
export function validateEnterMfaRequest(): ValidationChainFunc {
  return [
    validateCode({
      requiredKey: "pages.checkYourPhone.code.validationError.required",
      maxLengthKey: "pages.checkYourPhone.code.validationError.maxLength",
      minLengthKey: "pages.checkYourPhone.code.validationError.minLength",
      numbersOnlyKey: "pages.checkYourPhone.code.validationError.invalidFormat",
    }),
    validateBodyMiddlewareUpliftTemplate(
      UPLIFT_REQUIRED_SMS_TEMPLATE_NAME,
      ENTER_MFA_DEFAULT_TEMPLATE_NAME,
      enterMfaTemplateParametersFromRequest
    ),
  ];
}
