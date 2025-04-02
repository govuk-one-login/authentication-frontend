import { body } from "express-validator";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware";
export function validateEnterPasswordRequest() {
    return [
        body("password")
            .notEmpty()
            .withMessage((value, { req }) => {
            return req.t("pages.enterPassword.password.validationError.required", {
                value,
            });
        }),
        validateBodyMiddleware("enter-password/index.njk"),
    ];
}
export function validateEnterPasswordAccountExistsRequest() {
    return [
        body("password")
            .notEmpty()
            .withMessage((value, { req }) => {
            return req.t("pages.enterPasswordAccountExists.password.validationError.required", {
                value,
            });
        }),
        validateBodyMiddleware("enter-password/index-account-exists.njk", (req) => ({
            email: req.session.user.email,
        })),
    ];
}
