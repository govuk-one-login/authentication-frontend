import type { Request, Response } from "express";
import type {
  ApiResponseResult,
  DefaultApiResponse,
  ExpressRouteFunc,
} from "../../types.js";
import {
  ERROR_CODES,
  getErrorPathByCode,
  getNextPathAndUpdateJourney,
} from "../common/constants.js";
import {
  getCodeEnteredWrongBlockDurationInMinutes,
  supportReauthentication,
} from "../../config.js";
import type { VerifyMfaCodeInterface } from "./types.js";
import type { AccountRecoveryInterface } from "../common/account-recovery/types.js";
import { accountRecoveryService } from "../common/account-recovery/account-recovery-service.js";
import { BadRequestError, ReauthJourneyError } from "../../utils/error.js";
import {
  JOURNEY_TYPE,
  MFA_METHOD_TYPE,
  PATH_NAMES,
} from "../../app.constants.js";
import { verifyMfaCodeService } from "../common/verify-mfa-code/verify-mfa-code-service.js";
import {
  formatValidationError,
  renderBadRequest,
} from "../../utils/validation.js";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine.js";
import { getJourneyTypeFromUserSession } from "../common/journey/journey.js";
import { isLocked } from "../../utils/lock-helper.js";
import { isUpliftRequired } from "../../utils/request.js";
import { isAccountRecoveryPermitted } from "../common/account-recovery/account-recovery-helper.js";
export const ENTER_AUTH_APP_CODE_DEFAULT_TEMPLATE_NAME =
  "enter-authenticator-app-code/index.njk";
export const UPLIFT_REQUIRED_AUTH_APP_TEMPLATE_NAME =
  "enter-authenticator-app-code/index-2fa-service-uplift-auth-app.njk";

export function enterAuthenticatorAppCodeGet(
  acctRecoveryService: AccountRecoveryInterface = accountRecoveryService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const templateName = isUpliftRequired(req)
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

    req.session.user.isAccountRecoveryPermitted =
      await isAccountRecoveryPermitted(req, res, acctRecoveryService);

    return res.render(
      templateName,
      enterAuthenticatorAppCodeTemplateParametersFromRequest(req)
    );
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

    const template = isUpliftRequired(req)
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
        res,
        USER_JOURNEY_EVENTS.AUTH_APP_CODE_VERIFIED,
        {
          isIdentityRequired: req.session.user.isIdentityRequired,
          isLatestTermsAndConditionsAccepted:
            req.session.user.isLatestTermsAndConditionsAccepted,
        },
      )
    );
  };
};

async function handleAuthAppCodePostError(
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
    return renderBadRequest(
      res,
      req,
      template,
      error,
      enterAuthenticatorAppCodeTemplateParametersFromRequest(req)
    );
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

export function enterAuthenticatorAppCodeTemplateParametersFromRequest(
  req: Request
): Record<string, unknown> {
  const hasMultipleMfaMethods = req.session.user.mfaMethods?.length > 1;

  return {
    isAccountRecoveryPermitted: req.session.user.isAccountRecoveryPermitted,
    hasMultipleMfaMethods,
    mfaIssuePath: hasMultipleMfaMethods
      ? PATH_NAMES.HOW_DO_YOU_WANT_SECURITY_CODES
      : PATH_NAMES.MFA_RESET_WITH_IPV,
  };
}
