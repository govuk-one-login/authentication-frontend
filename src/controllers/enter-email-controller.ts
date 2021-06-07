import {NextFunction, Request, Response} from "express";
import {check} from "express-validator";
import {User} from "../services/user-service";
import {getUserService} from "../services/service-injection";

type ExpressRouteFunc = (req: Request, res: Response, next?: NextFunction) => void | Promise<void>;

export const enterEmailValidationRules = () => {
  return [
    check("email")
        .not()
        .isEmpty()
        .withMessage((value, { req }) => {
          return req.t("pages.enter-email.email.validationError.required", { value });
        }),
    check("email")
        .isLength({max:256})
        .withMessage((value, { req }) => {
          return req.t("pages.enter-email.email.validationError.length", { value });
        }),
    check("email")
        .isEmail()
        .withMessage((value, { req }) => {
          return req.t("pages.enter-email.email.validationError.email", { value });
        })
  ];
};

export const enterEmailGet = (req: Request, res: Response): void => {
  res.render("enter-email.html");
};

export const enterEmailPost = (userService: User = getUserService()): ExpressRouteFunc => {
  return async function(req: Request, res: Response) {
    const result = await userService.useEmailExists(req.body["email"]);

    if(result){
      res.redirect("enter-password");
    }

    //TODO needs to send email for new account creation

    res.redirect("verify-email");
  }
}
