import { validateBodyMiddleware } from "../../middleware/form-validation-middleware";
import { validateCode } from "../common/verify-code/verify-code-validation";
export function validateResetPasswordCheckEmailRequest() {
    return [
        validateCode({
            requiredKey: "pages.resetPasswordCheckEmail.code.validationError.required",
            maxLengthKey: "pages.resetPasswordCheckEmail.code.validationError.maxLength",
            minLengthKey: "pages.resetPasswordCheckEmail.code.validationError.minLength",
            numbersOnlyKey: "pages.resetPasswordCheckEmail.code.validationError.invalidFormat",
        }),
        validateBodyMiddleware("reset-password-check-email/index.njk"),
    ];
}
