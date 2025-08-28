import type { Request, Response } from "express";
import type { ExpressRouteFunc } from "src/types.js";
import { ERROR_CODES, getErrorPathByCode } from "../common/constants.js";
import { getNextPathAndUpdateJourney } from "../common/state-machine/state-machine-executor.js";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine.js";
import type { VerifyMfaCodeInterface } from "../enter-authenticator-app-code/types.js";
import { verifyMfaCodeService } from "../common/verify-mfa-code/verify-mfa-code-service.js";
import {
  JOURNEY_TYPE,
  MFA_METHOD_TYPE,
  PATH_NAMES,
} from "../../app.constants.js";
import {
  formatValidationError,
  renderBadRequest,
} from "../../utils/validation.js";
import { BadRequestError } from "../../utils/error.js";
import { getCodeEnteredWrongBlockDurationInMinutes } from "../../config.js";
import { isLocked, timestampNMinutesFromNow } from "../../utils/lock-helper.js";

const TEMPLATE_NAME = "reset-password-2fa-auth-app/index.njk";

export function resetPassword2FAAuthAppGet(): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    if (isLocked(req.session.user.wrongCodeEnteredPasswordResetMfaLock)) {
      return res.render(
        "security-code-error/index-security-code-entered-exceeded.njk",
        {
          newCodeLink: PATH_NAMES.RESET_PASSWORD_2FA_AUTH_APP,
          isAuthApp: true,
          show2HrScreen: true,
        }
      );
    }

    const hasMultipleMfaMethods = req.session.user.mfaMethods?.length > 1;
    const chooseMfaMethodHref = PATH_NAMES.HOW_DO_YOU_WANT_SECURITY_CODES;

    return res.render(TEMPLATE_NAME, {
      hasMultipleMfaMethods,
      chooseMfaMethodHref,
    });
  };
}

export function resetPassword2FAAuthAppPost(
  service: VerifyMfaCodeInterface = verifyMfaCodeService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;

    const result = await service.verifyMfaCode(
      MFA_METHOD_TYPE.AUTH_APP,
      req.body["code"],
      sessionId,
      clientSessionId,
      persistentSessionId,
      req,
      JOURNEY_TYPE.PASSWORD_RESET_MFA
    );

    if (!result.success) {
      if (result.data.code === ERROR_CODES.AUTH_APP_INVALID_CODE) {
        const error = formatValidationError(
          "code",
          req.t(
            "pages.enterAuthenticatorAppCode.code.validationError.invalidCode"
          )
        );
        return renderBadRequest(res, req, TEMPLATE_NAME, error);
      }

      if (
        result.data.code ===
        ERROR_CODES.AUTH_APP_INVALID_CODE_MAX_ATTEMPTS_REACHED
      ) {
        req.session.user.wrongCodeEnteredLock = timestampNMinutesFromNow(
          getCodeEnteredWrongBlockDurationInMinutes()
        );
      }

      const path = getErrorPathByCode(result.data.code);

      if (path) {
        return res.redirect(path);
      }

      throw new BadRequestError(result.data.message, result.data.code);
    }
    return res.redirect(
      await getNextPathAndUpdateJourney(
        req,
        res,
        USER_JOURNEY_EVENTS.MFA_CODE_VERIFIED,
        {
          isIdentityRequired: req.session.user.isIdentityRequired,
        }
      )
    );
  };
}
