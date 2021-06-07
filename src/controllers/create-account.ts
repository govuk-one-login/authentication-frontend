import {NextFunction, Request, Response} from "express";
import { check } from "express-validator";
import {UserService} from "../services/user-service";

type ExpressRouteFunc = (req: Request, res: Response, next?: NextFunction) => void | Promise<void>;

export function createPasswordValidationRules() {
    return [
        check("password")
            .isAlphanumeric()
            .withMessage((value, {req}) => {
                return req.t("no numbers", {value});
            }),
        check("password")
            .isEmpty()
            .withMessage((value, {req}) => {
                return req.t("empty", {value});
            }),
        check("password")
            .isLength({min: 8})
            .withMessage((value, {req}) => {
                return req.t("not length", {value});
            })
    ];
}

export function enterPasswordGet(req: Request, res: Response): void {
    res.render("create-account.html");
}

export function enterPasswordPost(userService: UserService): ExpressRouteFunc {
    return async function (req: Request, res: Response) {
        const result = await userService.addUser(req.body["email"], req.body["password"]);
        res.redirect("create-2fa");
    }
}

export function verifyEmailGet(req: Request, res: Response): void {
    res.render("verify-email.html");
}