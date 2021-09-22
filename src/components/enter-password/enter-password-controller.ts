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

const MULTIPLE_INCORRECT_PASSWORD_TEMPLATE = "enter-password/index-multiple-incorrect-passwords.njk";
const ENTER_PASSWORD_TEMPLATE = "enter-password/index.njk";
const ENTER_PASSWORD_VALIDATION_KEY =
  "pages.enterPassword.password.validationError.incorrectPassword";

const ENTER_PASSWORD_ACCOUNT_EXISTS_TEMPLATE =
  "enter-password/enter-password-account-exists.njk";
const ENTER_PASSWORD_ACCOUNT_EXISTS_VALIDATION_KEY =
  "pages.enterPasswordAccountExists.password.validationError.incorrectPassword";

export function enterPasswordGet(req: Request, res: Response): void {
  res.render(ENTER_PASSWORD_TEMPLATE);
}

export function enterPasswordAccountExistsGet(
  req: Request,
  res: Response
): void {
  const { email } = req.session.user;
  res.render(ENTER_PASSWORD_ACCOUNT_EXISTS_TEMPLATE, {
    email: email,
  });
}

function isUserLoggedIn(userLogin: UserLogin) {
  return (
    userLogin.sessionState && userLogin.sessionState === USER_STATE.LOGGED_IN
  );
}

export function enterPasswordPost(
  fromAccountExists = false,
  service: EnterPasswordServiceInterface = enterPasswordService(),
  mfaCodeService: MfaServiceInterface = mfaService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { email } = req.session.user;
    const id = res.locals.sessionId;
    const userLogin = await service.loginUser(id, email, req.body["password"]);

    if (isUserLoggedIn(userLogin)) {
      req.session.user.phoneNumber = userLogin.redactedPhoneNumber;
      await mfaCodeService.sendMfaCode(id, email);
      return res.redirect(PATH_NAMES.ENTER_MFA);
    }

    if (fromAccountExists) {
      renderValidationError(
        req,
        res,
        ENTER_PASSWORD_ACCOUNT_EXISTS_TEMPLATE,
        ENTER_PASSWORD_ACCOUNT_EXISTS_VALIDATION_KEY
      );
    } else {
      renderValidationError(
        req,
        res,
        ENTER_PASSWORD_TEMPLATE,
        ENTER_PASSWORD_VALIDATION_KEY
      );
    }
  };
}

function renderValidationError(
  req: Request,
  res: Response,
  fromTemplateName: string,
  validationMessageKey: string
) {
  const error = formatValidationError("password", req.t(validationMessageKey));
  renderBadRequest(res, req, fromTemplateName, error);
}
