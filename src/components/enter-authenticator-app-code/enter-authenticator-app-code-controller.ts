import { Request, Response } from "express";
import {
  ApiResponseResult,
  DefaultApiResponse,
  ExpressRouteFunc,
} from "../../types";
import {
  ERROR_CODES,
  getErrorPathByCode,
  getNextPathAndUpdateJourney,
  pathWithQueryParam,
} from "../common/constants";
import {
  getCodeEnteredWrongBlockDurationInMinutes,
  supportAccountRecovery,
  supportReauthentication,
} from "../../config";
import { VerifyMfaCodeInterface } from "./types";
import { AccountRecoveryInterface } from "../common/account-recovery/types";
import { accountRecoveryService } from "../common/account-recovery/account-recovery-service";
import { BadRequestError, ReauthJourneyError } from "../../utils/error";
import { JOURNEY_TYPE, MFA_METHOD_TYPE, PATH_NAMES } from "../../app.constants";
import { verifyMfaCodeService } from "../common/verify-mfa-code/verify-mfa-code-service";
import {
  formatValidationError,
  renderBadRequest,
} from "../../utils/validation";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";
import { getJourneyTypeFromUserSession } from "../common/journey/journey";
import { isLocked } from "../../utils/lock-helper";

export const ENTER_AUTH_APP_CODE_DEFAULT_TEMPLATE_NAME =
  "enter-authenticator-app-code/index.njk";
export const UPLIFT_REQUIRED_AUTH_APP_TEMPLATE_NAME =
  "enter-authenticator-app-code/index-2fa-service-uplift-auth-app.njk";

export function enterAuthenticatorAppCodeGet(
  service: AccountRecoveryInterface = accountRecoveryService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { email, isUpliftRequired } = req.session.user;

    const templateName = isUpliftRequired
      ? UPLIFT_REQUIRED_AUTH_APP_TEMPLATE_NAME
      : ENTER_AUTH_APP_CODE_DEFAULT_TEMPLATE_NAME;

    if (isLocked(req.session.user.wrongCodeEnteredLock)) {
      return res.render(
        "security-code-error/index-security-code-entered-exceeded.njk",
        {
          newCodeLink: PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE,
          isAuthApp: true,
          show2HrScreen: true,
        }
      );
    }

    const isAccountRecoveryEnabledForEnvironment = supportAccountRecovery();

    if (!isAccountRecoveryEnabledForEnvironment) {
      return res.render(templateName, {
        isAccountRecoveryPermitted: false,
      });
    }

    const { sessionId, clientSessionId, persistentSessionId } = res.locals;

    const accountRecoveryResponse = await service.accountRecovery(
      sessionId,
      clientSessionId,
      email,
      persistentSessionId,
      req
    );

    if (!accountRecoveryResponse.success) {
      throw new BadRequestError(
        accountRecoveryResponse.data.message,
        accountRecoveryResponse.data.code
      );
    }

    const isAccountRecoveryPermittedForUser =
      (req.session.user.isAccountRecoveryPermitted =
        accountRecoveryResponse.data.accountRecoveryPermitted);

    const checkEmailLink = pathWithQueryParam(
      PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES,
      "type",
      MFA_METHOD_TYPE.AUTH_APP
    );

    return res.render(templateName, {
      isAccountRecoveryPermitted: isAccountRecoveryPermittedForUser,
      checkEmailLink,
    });
  };
}

function handleReauthFailure(req: Request, res: Response) {
  if (req.session.client?.redirectUri) {
    return res.redirect(
      req.session.client.redirectUri.concat("?error=login_required")
    );
  } else {
    throw new ReauthJourneyError(
      "Re-auth journey failed due to missing redirect uri in client session."
    );
  }
}

export const enterAuthenticatorAppCodePost = (
  service: VerifyMfaCodeInterface = verifyMfaCodeService()
): ExpressRouteFunc => {
  return async function (req: Request, res: Response) {
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;
    const { isUpliftRequired } = req.session.user;

    const template = isUpliftRequired
      ? UPLIFT_REQUIRED_AUTH_APP_TEMPLATE_NAME
      : ENTER_AUTH_APP_CODE_DEFAULT_TEMPLATE_NAME;

    const journeyType = getJourneyTypeFromUserSession(req.session.user, {
      includeAccountRecovery: true,
      includeReauthentication: true,
      fallbackJourneyType: JOURNEY_TYPE.SIGN_IN,
    });

    const result = await service.verifyMfaCode(
      MFA_METHOD_TYPE.AUTH_APP,
      req.body["code"],
      sessionId,
      clientSessionId,
      persistentSessionId,
      req,
      journeyType
    );

    if (!result.success) {
      return handleAuthAppCodePostError(
        req,
        res,
        template,
        journeyType,
        result
      );
    }

    res.redirect(
      await getNextPathAndUpdateJourney(
        req,
        req.path,
        USER_JOURNEY_EVENTS.AUTH_APP_CODE_VERIFIED,
        {
          isIdentityRequired: req.session.user.isIdentityRequired,
          isLatestTermsAndConditionsAccepted:
            req.session.user.isLatestTermsAndConditionsAccepted,
        },
        res.locals.sessionId
      )
    );
  };
};

function handleAuthAppCodePostError(
  req: Request,
  res: Response,
  template: string,
  journeyType: JOURNEY_TYPE,
  result: ApiResponseResult<DefaultApiResponse>
) {
  const error = result.data.code;
  if (error === ERROR_CODES.AUTH_APP_INVALID_CODE) {
    const error = formatValidationError(
      "code",
      req.t("pages.enterAuthenticatorAppCode.code.validationError.invalidCode")
    );
    return renderBadRequest(res, req, template, error);
  }

  const isReauthJourneyInEnvWithReauthConfigured =
    supportReauthentication() && journeyType == JOURNEY_TYPE.REAUTHENTICATION;

  if (error === ERROR_CODES.AUTH_APP_INVALID_CODE_MAX_ATTEMPTS_REACHED) {
    if (isReauthJourneyInEnvWithReauthConfigured) {
      return handleReauthFailure(req, res);
    }
    req.session.user.wrongCodeEnteredLock = new Date(
      Date.now() + getCodeEnteredWrongBlockDurationInMinutes() * 60000
    ).toUTCString();
  }

  if (error === ERROR_CODES.RE_AUTH_SIGN_IN_DETAILS_ENTERED_EXCEEDED) {
    if (isReauthJourneyInEnvWithReauthConfigured) {
      return handleReauthFailure(req, res);
    } else {
      throw new ReauthJourneyError(
        "Reauth error response returned on a non reauth journey"
      );
    }
  }

  const path = getErrorPathByCode(result.data.code);

  if (path) {
    return res.redirect(path);
  }

  throw new BadRequestError(result.data.message, result.data.code);
}
