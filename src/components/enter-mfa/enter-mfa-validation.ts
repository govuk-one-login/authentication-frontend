import { validateBodyMiddlewareUpliftTemplate } from "../../middleware/form-validation-middleware";
import { ValidationChainFunc } from "../../types";
import { validateCode } from "../common/verify-code/verify-code-validation";
import {
  ENTER_MFA_DEFAULT_TEMPLATE_NAME,
  UPLIFT_REQUIRED_SMS_TEMPLATE_NAME,
} from "./enter-mfa-controller";

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
      ENTER_MFA_DEFAULT_TEMPLATE_NAME
    ),
  ];
}
