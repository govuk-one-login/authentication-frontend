import {Request, Response} from "express";
import {check} from "express-validator";
import {UserService} from "../services/user-service";
import {ExpressRouteFunc} from "../types/express";
import {getUserService} from "../services/service-injection";
import {containsNumber} from "../utils/string-utils";

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

export function  createAccountPost(userService: UserService = getUserService()): ExpressRouteFunc {
    return async function (req: Request, res: Response) {
        const result = await userService.addUser(req.body["email"], req.body["password"]);
        return res.redirect("create-2fa");
    }
}

export function verifyEmailGet(req: Request, res: Response): void {
    res.render("verify-email.html");
}

