import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import {
  ERROR_CODES,
  getErrorPathByCode,
  getNextPathAndUpdateJourney,
  pathWithQueryParam,
} from "../common/constants";
import { supportAccountRecovery } from "../../config";
import { VerifyMfaCodeInterface, VerifyMfaCodeConfig } from "./types";
import { authenticatorAppCodeService } from "./enter-authenticator-app-code-service";
import { AccountRecoveryInterface } from "../common/account-recovery/types";
import { accountRecoveryService } from "../common/account-recovery/account-recovery-service";
import { BadRequestError } from "../../utils/error";
import {
  formatValidationError,
  renderBadRequest,
} from "../../utils/validation";
import { MFA_METHOD_TYPE, PATH_NAMES } from "../../app.constants";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";

const TEMPLATE_NAME = "enter-authenticator-app-code/index.njk";

export function enterAuthenticatorAppCodeGet(
  service: AccountRecoveryInterface = accountRecoveryService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    if (
      req.session.user.wrongCodeEnteredLock &&
      new Date().toUTCString() < req.session.user.wrongCodeEnteredLock
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
      return res.render(TEMPLATE_NAME, {
        isAccountRecoveryPermitted: false,
      });
    }

    const { email } = req.session.user;
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

    return res.render(TEMPLATE_NAME, {
      isAccountRecoveryPermitted: isAccountRecoveryPermittedForUser,
      checkEmailLink,
    });
  };
}

export const enterAuthenticatorAppCodePost = (
  service: VerifyMfaCodeInterface = authenticatorAppCodeService()
): ExpressRouteFunc => {
  return verifyAuthenticatorAppCodePost(service, {
    template: TEMPLATE_NAME,
    validationKey:
      "pages.enterAuthenticatorAppCode.code.validationError.invalidCode",
    validationErrorCode: ERROR_CODES.AUTH_APP_INVALID_CODE,
  });
};

export function verifyAuthenticatorAppCodePost(
  service: VerifyMfaCodeInterface,
  options: VerifyMfaCodeConfig
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const code = req.body["code"];
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;

    const result = await service.verifyMfaCode(
      MFA_METHOD_TYPE.AUTH_APP,
      code,
      false,
      sessionId,
      clientSessionId,
      req.ip,
      persistentSessionId
    );

    if (!result.success) {
      if (result.data.code === options.validationErrorCode) {
        const error = formatValidationError(
          "code",
          req.t(options.validationKey)
        );
        return renderBadRequest(res, req, options.template, error);
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
}
