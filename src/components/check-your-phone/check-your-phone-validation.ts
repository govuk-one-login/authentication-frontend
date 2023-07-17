import { validateBodyMiddleware } from "../../middleware/form-validation-middleware";
import { ValidationChainFunc } from "../../types";
import { validateCode } from "../common/verify-code/verify-code-validation";
import { pathWithQueryParam } from "../common/constants";
import { PATH_NAMES } from "../../app.constants";

export function validateSmsCodeRequest(): ValidationChainFunc {
  return [
    validateCode({
      requiredKey: "pages.checkYourPhone.code.validationError.required",
      maxLengthKey: "pages.checkYourPhone.code.validationError.maxLength",
      minLengthKey: "pages.checkYourPhone.code.validationError.minLength",
      numbersOnlyKey: "pages.checkYourPhone.code.validationError.invalidFormat",
    }),
    validateBodyMiddleware("check-your-phone/index.njk", postValidationLocals),
  ];
}

const postValidationLocals = function locals(): Record<string, unknown> {
  const resendCodeLinkAsPostValidationLocal = pathWithQueryParam(
    PATH_NAMES.RESEND_MFA_CODE_ACCOUNT_CREATION,
    "isResendCodeRequest",
    "true"
  );
  return {
    resendCodeLink: resendCodeLinkAsPostValidationLocal,
  };
};
