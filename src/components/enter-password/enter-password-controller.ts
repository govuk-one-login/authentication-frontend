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
import { BadRequestError, ReauthJourneyError } from "../../utils/error";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";
import { JOURNEY_TYPE, MFA_METHOD_TYPE, PATH_NAMES } from "../../app.constants";
import xss from "xss";
import { EnterEmailServiceInterface } from "../enter-email/types";
import { enterEmailService } from "../enter-email/enter-email-service";
import { support2hrLockout, supportAccountInterventions } from "../../config";
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
  const isReauthJourney =
    getJourneyTypeFromUserSession(req.session.user, {
      includeReauthentication: true,
    }) == JOURNEY_TYPE.REAUTHENTICATION;
  res.render(ENTER_PASSWORD_TEMPLATE, { isReauthJourney: isReauthJourney });
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
      clientSessionId,
      persistentSessionId,
      req
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
  mfaCodeService: MfaServiceInterface = mfaService(),
  accountInterventionsService: AccountInterventionsInterface = accountInterventionService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { isAccountCreationJourney } = req.session.user;
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
      persistentSessionId,
      req,
      journeyType
    );

    if (!userLogin.success) {
      const errorCode = userLogin.data.code;
      if (
        errorCode === ERROR_CODES.INVALID_PASSWORD_MAX_ATTEMPTS_REACHED ||
        errorCode === ERROR_CODES.RE_AUTH_SIGN_IN_DETAILS_ENTERED_EXCEEDED
      ) {
        return handleMaxCredentialsReached(errorCode, journeyType, res, req);
      }

      if (errorCode === ERROR_CODES.SESSION_ID_MISSING_OR_INVALID) {
        req.log.warn(
          `Backend session is missing or invalid - user cannot enter password. Session id ${sessionId}`
        );
        return res.redirect(PATH_NAMES.ERROR_PAGE);
      }

      let validationKey;
      if (support2hrLockout()) {
        validationKey = fromAccountExists
          ? ENTER_PASSWORD_ACCOUNT_EXISTS_VALIDATION_KEY
          : ENTER_PASSWORD_VALIDATION_KEY;
      } else {
        validationKey = fromAccountExists
          ? ENTER_PASSWORD_ACCOUNT_EXISTS_VALIDATION_KEY_OLD
          : ENTER_PASSWORD_VALIDATION_KEY_OLD;
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
    req.session.user.isAccountPartCreated = !userLogin.data.mfaMethodVerified;
    req.session.user.isLatestTermsAndConditionsAccepted =
      userLogin.data.latestTermsAndConditionsAccepted;
    req.session.user.isPasswordChangeRequired = isPasswordChangeRequired;

    if (isPasswordChangeRequired && supportAccountInterventions()) {
      const accountInterventionsResponse =
        await accountInterventionsService.accountInterventionStatus(
          sessionId,
          email,
          clientSessionId,
          persistentSessionId,
          req
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
        persistentSessionId,
        false,
        xss(req.cookies.lng as string),
        req,
        journeyType
      );

      if (!result.success) {
        if (result.data.code === ERROR_CODES.MFA_CODE_REQUESTS_BLOCKED) {
          return res.render("security-code-error/index-wait.njk");
        }

        if (result.data.code === ERROR_CODES.ENTERED_INVALID_MFA_MAX_TIMES) {
          return res.render(
            "security-code-error/index-security-code-entered-exceeded.njk",
            {
              show2HrScreen: support2hrLockout(),
              contentId: "727a0395-cc00-48eb-a411-bfe9d8ac5fc8",
              taxonomyLevel2: isAccountCreationJourney
                ? "create account"
                : "sign in",
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
          mfaMethodType: userLogin.data.mfaMethodType,
          isMfaMethodVerified: userLogin.data.mfaMethodVerified,
          isPasswordChangeRequired: isPasswordChangeRequired,
        },
        sessionId
      )
    );
  };

  function handleMaxCredentialsReached(
    errorCode: number,
    journeyType: JOURNEY_TYPE,
    res: Response,
    req: Request
  ) {
    if (journeyType != JOURNEY_TYPE.REAUTHENTICATION) {
      if (errorCode == ERROR_CODES.RE_AUTH_SIGN_IN_DETAILS_ENTERED_EXCEEDED) {
        throw new ReauthJourneyError(
          "Reauth error code from login handler returned on a non-reauth journey"
        );
      }
      return res.redirect(getErrorPathByCode(errorCode));
    }
    if (!req.session.client?.redirectUri) {
      throw new ReauthJourneyError(
        "Re-auth journey failed due to missing redirect uri in client session."
      );
    }
    return res.redirect(
      req.session.client.redirectUri.concat("?error=login_required")
    );
  }
}
