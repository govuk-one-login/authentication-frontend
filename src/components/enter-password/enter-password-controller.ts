import { Request, Response } from "express";
import { PATH_NAMES, USER_STATE } from "../../app.constants";
import { ExpressRouteFunc } from "../../types";
import {
  formatValidationError,
  renderBadRequest,
} from "../../utils/validation";
import { enterPasswordService } from "./enter-password-service";
import { EnterPasswordServiceInterface, UserLogin } from "./types";
import { MfaServiceInterface } from "../common/mfa/types";
import { mfaService } from "../common/mfa/mfa-service";

const TEMPLATE_NAME = "enter-password/index.njk";

export function enterPasswordGet(req: Request, res: Response): void {
  res.render("enter-password/index.njk");
}

function isUserAuthenticated(userLogin: UserLogin) {
  return (
    userLogin.sessionState &&
    userLogin.sessionState === USER_STATE.AUTHENTICATED
  );
}

export function enterPasswordPost(
  service: EnterPasswordServiceInterface = enterPasswordService(),
  mfaCodeService: MfaServiceInterface = mfaService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { id, email } = req.session.user;
    const userLogin = await service.loginUser(id, email, req.body["password"]);

    if (isUserAuthenticated(userLogin)) {
      req.session.user.phoneNumber = userLogin.redactedPhoneNumber;
      await mfaCodeService.sendMfaCode(id, email);
      return res.redirect(PATH_NAMES.ENTER_MFA);
    }

    const error = formatValidationError(
      "password",
      req.t("pages.enterPassword.password.validationError.incorrectPassword")
    );

    renderBadRequest(res, req, TEMPLATE_NAME, error);
  };
}
