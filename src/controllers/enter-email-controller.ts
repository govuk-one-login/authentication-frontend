import {Request, Response} from "express";
import {check} from "express-validator";
import {UserService} from "../services/user-service";
import {getUserService} from "../services/service-injection";
import {PATH_NAMES} from "../app.constants";
import {ExpressRouteFunc} from "../types/express";

export const ENTER_EMAIL_TEMPLATE="enter-email.html";

export function enterEmailValidationSchema() {
    return [
        check("email")
            .trim()
            .notEmpty()
            .withMessage((value, {req}) => {
                return req.t("pages.enterEmail.email.validationError.required", {value});
            })
            .isLength({max: 256})
            .withMessage((value, {req}) => {
                return req.t("pages.enterEmail.email.validationError.length", {value});
            })
            .isEmail()
            .withMessage((value, {req}) => {
                return req.t("pages.enterEmail.email.validationError.email", {value});
            })
    ];
}

export function enterEmailGet(req: Request, res: Response): void {
    res.render(ENTER_EMAIL_TEMPLATE);
}

export function enterEmailPost(userService: UserService = getUserService()): ExpressRouteFunc {
    return async function (req: Request, res: Response) {
        const result = await userService.useEmailExists(req.body["email"]);

        if (result) {
            return res.redirect(PATH_NAMES.ENTER_PASSWORD);
        }
        return res.redirect(PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD);
    }
}

