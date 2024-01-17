import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import {
  ERROR_CODES,
  getErrorPathByCode,
  getNextPathAndUpdateJourney,
  pathWithQueryParam,
} from "../common/constants";
import {
  getCodeEnteredWrongBlockDurationInMinutes,
  supportAccountRecovery,
} from "../../config";
import { VerifyMfaCodeInterface } from "./types";
import { AccountRecoveryInterface } from "../common/account-recovery/types";
import { accountRecoveryService } from "../common/account-recovery/account-recovery-service";
import { BadRequestError } from "../../utils/error";
import { JOURNEY_TYPE, MFA_METHOD_TYPE, PATH_NAMES } from "../../app.constants";
import { verifyMfaCodeService } from "../common/verify-mfa-code/verify-mfa-code-service";
import {
  formatValidationError,
  renderBadRequest,
} from "../../utils/validation";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";
import { getJourneyTypeFromUserSession } from "../common/journey/journey";

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

    if (
      req.session.user.wrongCodeEnteredLock &&
      new Date().getTime() <
        new Date(req.session.user.wrongCodeEnteredLock).getTime()
    ) {
      return res.render(
        "security-code-error/index-security-code-entered-exceeded.njk",
        {
          newCodeLink: PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE,
          isAuthApp: true,
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
      req.ip,
      persistentSessionId
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

export const enterAuthenticatorAppCodePost = (
  service: VerifyMfaCodeInterface = verifyMfaCodeService()
): ExpressRouteFunc => {
  return async function (req: Request, res: Response) {
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;
    const { isUpliftRequired } = req.session.user;

    const template = isUpliftRequired
      ? UPLIFT_REQUIRED_AUTH_APP_TEMPLATE_NAME
      : ENTER_AUTH_APP_CODE_DEFAULT_TEMPLATE_NAME;

    const result = await service.verifyMfaCode(
      MFA_METHOD_TYPE.AUTH_APP,
      req.body["code"],
      sessionId,
      clientSessionId,
      req.ip,
      persistentSessionId,
      getJourneyTypeFromUserSession(req.session.user, {
        includeAccountRecovery: true,
        includeReauthentication: true,
        fallbackJourneyType: JOURNEY_TYPE.SIGN_IN,
      })
    );

    if (!result.success) {
      if (result.data.code === ERROR_CODES.AUTH_APP_INVALID_CODE) {
        const error = formatValidationError(
          "code",
          req.t(
            "pages.enterAuthenticatorAppCode.code.validationError.invalidCode"
          )
        );
        return renderBadRequest(res, req, template, error);
      }

      if (
        result.data.code ===
        ERROR_CODES.AUTH_APP_INVALID_CODE_MAX_ATTEMPTS_REACHED
      ) {
        req.session.user.wrongCodeEnteredLock = new Date(
          Date.now() + getCodeEnteredWrongBlockDurationInMinutes() * 60000
        ).toUTCString();
      }

      const path = getErrorPathByCode(result.data.code);

      if (path) {
        return res.redirect(path);
      }

      throw new BadRequestError(result.data.message, result.data.code);
    }

    res.redirect(
      getNextPathAndUpdateJourney(
        req,
        req.path,
        USER_JOURNEY_EVENTS.AUTH_APP_CODE_VERIFIED,
        {
          isIdentityRequired: req.session.user.isIdentityRequired,
          isConsentRequired: req.session.user.isConsentRequired,
          isLatestTermsAndConditionsAccepted:
            req.session.user.isLatestTermsAndConditionsAccepted,
        },
        res.locals.sessionId
      )
    );
  };
};
