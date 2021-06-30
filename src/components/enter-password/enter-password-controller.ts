import { Request, Response } from "express";
import { PATH_NAMES } from "../../app.constants";
import { ExpressRouteFunc } from "../../types";
import {
  formatValidationError,
  renderBadRequest,
} from "../../utils/validation";
import { enterPasswordService } from "./enter-password-service";
import { EnterPasswordServiceInterface } from "./types";

const TEMPLATE_NAME = "enter-password/index.njk";

export function enterPasswordGet(req: Request, res: Response): void {
  res.render("enter-password/index.njk");
}

export function enterPasswordPost(
  service: EnterPasswordServiceInterface = enterPasswordService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const isAuthenticated = await service.loginUser(
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
