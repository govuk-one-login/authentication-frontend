import { body } from "express-validator";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware";
import { isAccountRecoveryJourney } from "../../utils/request";
export function validateMultiFactorAuthenticationRequest() {
    return [
        body("mfaOptions")
            .notEmpty()
            .withMessage((value, { req }) => {
            return req.t("pages.getSecurityCodes.secondFactorRadios.errorMessage", {
                value,
            });
        }),
        validateBodyMiddleware("select-mfa-options/index.njk", postValidationLocals),
    ];
}
const postValidationLocals = function locals(req) {
    return {
        isAccountPartCreated: req.session.user.isAccountPartCreated,
        isAccountRecoveryJourney: isAccountRecoveryJourney(req),
    };
};
