import { Request, Response } from "express";
import { USER_STATE } from "../../app.constants";
import { ExpressRouteFunc } from "../../types";
import {
  formatValidationError,
  renderBadRequest,
} from "../../utils/validation";
import { enterPasswordService } from "./enter-password-service";
import { EnterPasswordServiceInterface } from "./types";
import { MfaServiceInterface } from "../common/mfa/types";
import { mfaService } from "../common/mfa/mfa-service";
import { getNextPathByState } from "../common/constants";

const ENTER_PASSWORD_TEMPLATE = "enter-password/index.njk";
const ENTER_PASSWORD_VALIDATION_KEY =
  "pages.enterPassword.password.validationError.incorrectPassword";

const ENTER_PASSWORD_ACCOUNT_EXISTS_TEMPLATE =
  "enter-password/index-account-exists.njk";
const ENTER_PASSWORD_ACCOUNT_EXISTS_VALIDATION_KEY =
  "pages.enterPasswordAccountExists.password.validationError.incorrectPassword";

export function enterPasswordGet(req: Request, res: Response): void {
  res.render(ENTER_PASSWORD_TEMPLATE);
}

export function enterPasswordAccountLockedGet(
  req: Request,
  res: Response
): void {
  res.render("enter-password/index-account-locked.njk");
}

export function enterPasswordAccountExistsGet(
  req: Request,
  res: Response
): void {
  const { email } = req.session;
  res.render(ENTER_PASSWORD_ACCOUNT_EXISTS_TEMPLATE, {
    email: email,
  });
}

export function enterPasswordPost(
  fromAccountExists = false,
  service: EnterPasswordServiceInterface = enterPasswordService(),
  mfaCodeService: MfaServiceInterface = mfaService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { email } = req.session;
    const { sessionId, clientSessionId } = res.locals;

    const userLogin = await service.loginUser(
      sessionId,
      email,
      req.body["password"],
      clientSessionId,
      req.ip
    );

    if (userLogin.success && userLogin.sessionState) {
      let redirectTo = getNextPathByState(userLogin.sessionState);
      req.session.phoneNumber = userLogin.redactedPhoneNumber;

      if (userLogin.sessionState === USER_STATE.LOGGED_IN) {
        const result = await mfaCodeService.sendMfaCode(
          sessionId,
          clientSessionId,
          email,
          req.ip
        );
        redirectTo = getNextPathByState(result.sessionState);
      }

      return res.redirect(redirectTo);
    }

    const error = formatValidationError(
      "password",
      req.t(
        fromAccountExists
          ? ENTER_PASSWORD_ACCOUNT_EXISTS_VALIDATION_KEY
          : ENTER_PASSWORD_VALIDATION_KEY
      )
    );

    return renderBadRequest(
      res,
      req,
      fromAccountExists
        ? ENTER_PASSWORD_ACCOUNT_EXISTS_TEMPLATE
        : ENTER_PASSWORD_TEMPLATE,
      error
    );
  };
}
