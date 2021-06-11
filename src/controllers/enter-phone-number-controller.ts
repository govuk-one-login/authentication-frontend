import {Request, Response} from "express";
import {check} from "express-validator";

export function enterPhoneNumberValidationSchema() {
    return [
        check("phoneNumber")
            .trim()
            .notEmpty()
            .withMessage((value, {req}) => {
                return req.t("pages.enterPhoneNumber.phoneNumber.validationError.required", {value});
            })
    ];
}

export function enterPhoneNumberGet(req: Request, res: Response): void {
    res.render("enter-phone-number.html");
}