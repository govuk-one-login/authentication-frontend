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
import {
  support2FABeforePasswordReset,
  supportAccountInterventions,
  support2hrLockout,
} from "../../config";
import { getJourneyTypeFromUserSession } from "../common/journey/journey";
import { accountInterventionService } from "../account-intervention/account-intervention-service";
import { AccountInterventionsInterface } from "../account-intervention/types";

const ENTER_PASSWORD_TEMPLATE = "enter-password/index.njk";
const ENTER_PASSWORD_VALIDATION_KEY_OLD =
  "pages.enterPassword.password.validationError.incorrectPassword_old";
const ENTER_PASSWORD_VALIDATION_KEY =
  "pages.enterPassword.password.validationError.incorrectPassword";

const ENTER_PASSWORD_ACCOUNT_EXISTS_TEMPLATE =
  "enter-password/index-account-exists.njk";
const ENTER_PASSWORD_ACCOUNT_EXISTS_VALIDATION_KEY_OLD =
  "pages.enterPasswordAccountExists.password.validationError.incorrectPassword_old";
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
        support2hrLockout: support2hrLockout(),
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
    support2hrLockout: support2hrLockout(),
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
  mfaCodeService: MfaServiceInterface = mfaService(),
  accountInterventionsService: AccountInterventionsInterface = accountInterventionService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { email } = req.session.user;
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;

    const journeyType = getJourneyTypeFromUserSession(req.session.user, {
      includeReauthentication: true,
    });

    const userLogin = await service.loginUser(
      sessionId,
      email,
      req.body["password"],
      clientSessionId,
      req.ip,
      persistentSessionId,
      journeyType
    );

    if (!userLogin.success) {
      if (
        userLogin.data.code ===
        ERROR_CODES.INVALID_PASSWORD_MAX_ATTEMPTS_REACHED
      ) {
        return res.redirect(getErrorPathByCode(userLogin.data.code));
      }
      let validationKey;
      if (support2hrLockout()) {
        if (fromAccountExists) {
          validationKey = ENTER_PASSWORD_ACCOUNT_EXISTS_VALIDATION_KEY;
        } else {
          validationKey = ENTER_PASSWORD_VALIDATION_KEY;
        }
      } else {
        if (fromAccountExists) {
          validationKey = ENTER_PASSWORD_ACCOUNT_EXISTS_VALIDATION_KEY_OLD;
        } else {
          validationKey = ENTER_PASSWORD_VALIDATION_KEY_OLD;
        }
      }
      const error = formatValidationError("password", req.t(validationKey));

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

    req.session.user.redactedPhoneNumber = userLogin.data.redactedPhoneNumber;
    req.session.user.isConsentRequired = userLogin.data.consentRequired;
    req.session.user.isAccountPartCreated = !userLogin.data.mfaMethodVerified;
    req.session.user.isLatestTermsAndConditionsAccepted =
      userLogin.data.latestTermsAndConditionsAccepted;
    req.session.user.isPasswordChangeRequired = isPasswordChangeRequired;

    if (isPasswordChangeRequired && supportAccountInterventions()) {
      const accountInterventionsResponse =
        await accountInterventionsService.accountInterventionStatus(
          sessionId,
          email,
          req.ip,
          clientSessionId,
          persistentSessionId
        );
      if (
        accountInterventionsResponse.data.passwordResetRequired ||
        accountInterventionsResponse.data.temporarilySuspended ||
        accountInterventionsResponse.data.blocked
      ) {
        return res.redirect(
          await getNextPathAndUpdateJourney(
            req,
            req.path,
            USER_JOURNEY_EVENTS.COMMON_PASSWORD_AND_AIS_STATUS,
            null,
            sessionId
          )
        );
      }
    }

    req.session.user.isSignInJourney = true;

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
        xss(req.cookies.lng as string),
        journeyType
      );

      if (!result.success) {
        if (result.data.code === ERROR_CODES.MFA_CODE_REQUESTS_BLOCKED) {
          return res.render("security-code-error/index-wait.njk", {
            support2hrLockout: support2hrLockout(),
          });
        }

        if (result.data.code === ERROR_CODES.ENTERED_INVALID_MFA_MAX_TIMES) {
          return res.render(
            "security-code-error/index-security-code-entered-exceeded.njk",
            {
              show2HrScreen: support2hrLockout(),
            }
          );
        }

        const path = getErrorPathByCode(result.data.code);

        if (path) {
          return res.redirect(path);
        }

        throw new BadRequestError(result.data.message, result.data.code);
      }
    }
    return res.redirect(
      await getNextPathAndUpdateJourney(
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
          support2FABeforePasswordReset: support2FABeforePasswordReset(),
        },
        sessionId
      )
    );
  };
}
