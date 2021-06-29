import { NextFunction, Request, Response } from "express";
import { AuthenticationServiceInterface } from "../../services/authentication-service.interface";
import { getUserService } from "../../services/service-injection";
import { PATH_NAMES, USER_STATE } from "../../app.constants";
import { ExpressRouteFunc } from "../../types";

export function enterPasswordGet(req: Request, res: Response): void {
  res.render("enter-password/index.njk");
}

export function enterPasswordPost(
  userService: AuthenticationServiceInterface = getUserService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const userState = await userService.logInUser(
        req.session.user.id,
        req.session.user.email,
        req.body["password"]
      );

      if (userState === USER_STATE.AUTHENTICATED) {
        return res.redirect(PATH_NAMES.LOG_IN_ENTER_PHONE_NUMBER); // FIXME: Ought to go to the service.
      }
    } catch (error) {
      next(error);
    }
  };
}
