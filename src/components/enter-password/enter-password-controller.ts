import { Request, Response } from "express";
import { AuthenticationServiceInterface } from "../../services/authentication-service.interface";
import { getUserService } from "../../services/service-injection";
import { PATH_NAMES } from "../../app.constants";
import { ExpressRouteFunc } from "../../types";
import {
  formatValidationError,
  renderBadRequest,
} from "../../utils/validation";

const TEMPLATE_NAME = "enter-password/index.njk";

export function enterPasswordGet(req: Request, res: Response): void {
  res.render("enter-password/index.njk");
}

export function enterPasswordPost(
  userService: AuthenticationServiceInterface = getUserService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const isAuthenticated = await userService.logInUser(
      req.session.user.id,
      req.session.user.email,
      req.body["password"]
    );

    if (isAuthenticated) {
      return res.redirect(PATH_NAMES.CHECK_YOUR_PHONE);
    }

    const error = formatValidationError(
      "password",
      req.t("pages.enterPassword.password.validationError.incorrectPassword")
    );

    renderBadRequest(res, req, TEMPLATE_NAME, error);
  };
}
