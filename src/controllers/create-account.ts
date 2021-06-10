import {Request, Response} from "express";
import {check} from "express-validator";
import {AuthenticationServiceInterface} from "../services/authentication-service.interface";
import {ExpressRouteFunc} from "../types/express";
import {getUserService} from "../services/service-injection";
import {containsNumber} from "../utils/string-utils";
import {PATH_NAMES} from "../app.constants"

export function createPasswordValidationSchema() {
    return [
        check("password")
            .trim()
            .notEmpty()
            .withMessage((value, {req}) => {
                return req.t("pages.createPassword.password.validationError.required", {value});
            })
            .isLength({min: 8})
            .withMessage((value, {req}) => {
                return req.t("pages.createPassword.password.validationError.length", {value});
            })
            .custom((value, { req }) => {
                if (!containsNumber(value)) {
                    throw new Error(req.t("pages.createPassword.password.validationError.alphaNumeric"));
                }
                return true;
            }),
        check('confirm-password')
            .trim()
            .notEmpty()
            .withMessage((value, {req}) => {
                return req.t("pages.createPassword.confirmPassword.validationError.required", {value});
            })
            .custom((value, { req }) => {
                if (value !== req.body['password']) {
                    throw new Error(req.t("pages.createPassword.confirmPassword.validationError.matches"));
                }
                return true;
            })
    ];
}

export function createAccountGet(req: Request, res: Response): void {
    res.render("create-account.html");
}

export function  createAccountPost(userService: AuthenticationServiceInterface = getUserService()): ExpressRouteFunc {
    return async function (req: Request, res: Response) {
        return res.redirect(PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER);
    }
}

export function verifyEmailGet(req: Request, res: Response): void {
    res.render("verify-email.html");
}

