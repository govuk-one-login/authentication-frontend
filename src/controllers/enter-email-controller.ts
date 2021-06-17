import { NextFunction, Request, Response } from "express";
import { body } from "express-validator";
import { AuthenticationServiceInterface } from "../services/authentication-service.interface";
import { getUserService } from "../services/service-injection";
import { PATH_NAMES } from "../app.constants";
import { ExpressRouteFunc } from "../types/express";

const ENTER_EMAIL_TEMPLATE = "enter-email.html";

export function validateEnterEmailRequest() {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t("pages.enterEmail.email.validationError.required", {
          value,
        });
      })
      .isLength({ max: 256 })
      .withMessage((value, { req }) => {
        return req.t("pages.enterEmail.email.validationError.length", {
          value,
        });
      })
      .isEmail()
      .withMessage((value, { req }) => {
        return req.t("pages.enterEmail.email.validationError.email", { value });
      }),
    validateBodyMiddleware(ENTER_EMAIL_TEMPLATE),
  ];
}

export function enterEmailGet(req: Request, res: Response): void {
  res.render(ENTER_EMAIL_TEMPLATE);
}

export function enterEmailPost(
  userService: AuthenticationServiceInterface = getUserService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const email = req.body["email"];

      req.session.user.email = email;

      if (await userService.userExists(email)) {
        return res.redirect(PATH_NAMES.ENTER_PASSWORD);
      }
      return res.redirect(PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD);
    } catch (err) {
      next(err);
    }
  };
}
