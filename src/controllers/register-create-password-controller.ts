import { NextFunction, Request, Response } from "express";
import { body } from "express-validator";
import { AuthenticationServiceInterface } from "../services/authentication-service.interface";
import { ExpressRouteFunc } from "../types/express";
import { getUserService } from "../services/service-injection";
import { containsNumber } from "../utils/string-utils";
import { PATH_NAMES } from "../app.constants";
import { validateBodyMiddleware } from "../middleware/form-validation-middleware";

const CREATE_PASSWORD_TEMPLATE = "create-account.html";

export function validateCreatePasswordRequest() {
  return [
    body("password")
      .trim()
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t("pages.createPassword.password.validationError.required", {
          value,
        });
      })
      .isLength({ min: 8 })
      .withMessage((value, { req }) => {
        return req.t("pages.createPassword.password.validationError.length", {
          value,
        });
      })
      .custom((value, { req }) => {
        if (!containsNumber(value)) {
          throw new Error(
            req.t("pages.createPassword.password.validationError.alphaNumeric")
          );
        }
        return true;
      }),
    body("confirm-password")
      .trim()
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t(
          "pages.createPassword.confirmPassword.validationError.required",
          { value }
        );
      })
      .custom((value, { req }) => {
        if (value !== req.body["password"]) {
          throw new Error(
            req.t(
              "pages.createPassword.confirmPassword.validationError.matches"
            )
          );
        }
        return true;
      }),
    validateBodyMiddleware(CREATE_PASSWORD_TEMPLATE),
  ];
}

export function createAccountGet(req: Request, res: Response): void {
  res.render(CREATE_PASSWORD_TEMPLATE);
}

export function createAccountPost(
  userService: AuthenticationServiceInterface = getUserService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      if (
        await userService.signUpUser(
          req.session.user.email,
          req.body["password"]
        )
      ) {
        return res.redirect(PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER);
      }

      return res.redirect(PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD);
    } catch (err) {
      next(err);
    }
  };
}
