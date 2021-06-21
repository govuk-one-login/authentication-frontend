import { NextFunction, Request, Response } from "express";
import { AuthenticationServiceInterface } from "../../services/authentication-service.interface";
import { getUserService } from "../../services/service-injection";
import { PATH_NAMES, USER_STATE } from "../../app.constants";
import { ExpressRouteFunc } from "../../types";

export function createPasswordGet(req: Request, res: Response): void {
  res.render("register-create-password/index.njk");
}

export function createPasswordPost(
  userService: AuthenticationServiceInterface = getUserService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const userState = await userService.signUpUser(
        req.session.user.id,
        req.session.user.email,
        req.body["password"]
      );

      if (userState !== USER_STATE.REQUIRES_TWO_FACTOR) {
        return res.redirect(PATH_NAMES.CREATE_ACCOUNT_SUCCESSFUL);
      }

      return res.redirect(PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER);
    } catch (error) {
      next(error);
    }
  };
}
