import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import {
  formatValidationError,
  renderBadRequest,
} from "../../utils/validation";
import { enterPasswordService } from "./enter-password-service";
import { EnterPasswordServiceInterface } from "./types";
import { MfaServiceInterface } from "../common/mfa/types";
import { mfaService } from "../common/mfa/mfa-service";
import {
  ERROR_CODES,
  getErrorPathByCode,
  getNextPathAndUpdateJourney,
} from "../common/constants";
import { BadRequestError } from "../../utils/error";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";
import { MFA_METHOD_TYPE } from "../../app.constants";
import xss from "xss";
import { EnterEmailServiceInterface } from "../enter-email/types";
import { enterEmailService } from "../enter-email/enter-email-service";

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

export function enterSignInRetryBlockedGet(
  service: EnterEmailServiceInterface = enterEmailService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const email = req.session.user.email.toLowerCase();
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;

    const checkUserIsBlockedResponse = await service.userExists(
      sessionId,
      email,
      req.ip,
      clientSessionId,
      persistentSessionId
    );

    if (
      !checkUserIsBlockedResponse.success &&
      checkUserIsBlockedResponse.data.code === ERROR_CODES.ACCOUNT_LOCKED
    ) {
      return res.render("enter-password/index-sign-in-retry-blocked.njk", {
        newLink: "/sign-in-retry-blocked",
      });
    }

    return res.render(ENTER_PASSWORD_TEMPLATE);
  };
}

export function enterPasswordAccountLockedGet(
  req: Request,
  res: Response
): void {
  res.render("enter-password/index-account-locked.njk", {
    newLink: "/sign-in-retry-blocked",
  });
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

export function enterPasswordPost(
  fromAccountExists = false,
  service: EnterPasswordServiceInterface = enterPasswordService(),
  mfaCodeService: MfaServiceInterface = mfaService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { email } = req.session.user;
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;

    const userLogin = await service.loginUser(
      sessionId,
      email,
      req.body["password"],
      clientSessionId,
      req.ip,
      persistentSessionId
    );

    if (!userLogin.success) {
      if (
        userLogin.data.code ===
        ERROR_CODES.INVALID_PASSWORD_MAX_ATTEMPTS_REACHED
      ) {
        return res.redirect(getErrorPathByCode(userLogin.data.code));
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
        error,
        { email }
      );
    }

    const isPasswordChangeRequired = userLogin.data.passwordChangeRequired;

    req.session.user.phoneNumber = userLogin.data.redactedPhoneNumber;
    req.session.user.isConsentRequired = userLogin.data.consentRequired;
    req.session.user.isAccountPartCreated = !userLogin.data.mfaMethodVerified;
    req.session.user.isLatestTermsAndConditionsAccepted =
      userLogin.data.latestTermsAndConditionsAccepted;
    req.session.user.isPasswordChangeRequired = isPasswordChangeRequired;
    req.session.user.mfaMethodType = userLogin.data.mfaMethodType;

    if (
      userLogin.data.mfaRequired &&
      userLogin.data.mfaMethodVerified &&
      userLogin.data.mfaMethodType === MFA_METHOD_TYPE.SMS &&
      !isPasswordChangeRequired
    ) {
      const result = await mfaCodeService.sendMfaCode(
        sessionId,
        clientSessionId,
        email,
        req.ip,
        persistentSessionId,
        false,
        xss(req.cookies.lng as string)
      );

      if (!result.success) {
        const path = getErrorPathByCode(result.data.code);

        if (path) {
          return res.redirect(path);
        }

        throw new BadRequestError(result.data.message, result.data.code);
      }
    }
    return res.redirect(
      getNextPathAndUpdateJourney(
        req,
        req.path,
        USER_JOURNEY_EVENTS.CREDENTIALS_VALIDATED,
        {
          isLatestTermsAndConditionsAccepted:
            req.session.user.isLatestTermsAndConditionsAccepted,
          requiresTwoFactorAuth: userLogin.data.mfaRequired,
          isConsentRequired: req.session.user.isConsentRequired,
          mfaMethodType: userLogin.data.mfaMethodType,
          isMfaMethodVerified: userLogin.data.mfaMethodVerified,
          isPasswordChangeRequired: isPasswordChangeRequired,
        },
        sessionId
      )
    );
  };
}
