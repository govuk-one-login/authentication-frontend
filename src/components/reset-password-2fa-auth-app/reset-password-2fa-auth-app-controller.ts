import { Request, Response } from "express";
import { ExpressRouteFunc } from "src/types";
import {
  ERROR_CODES,
  getErrorPathByCode,
  getNextPathAndUpdateJourney,
} from "../common/constants";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";
import { VerifyMfaCodeInterface } from "../enter-authenticator-app-code/types";
import { verifyMfaCodeService } from "../common/verify-mfa-code/verify-mfa-code-service";
import { JOURNEY_TYPE, MFA_METHOD_TYPE } from "../../app.constants";
import {
  formatValidationError,
  renderBadRequest,
} from "../../utils/validation";
import { BadRequestError } from "../../utils/error";

const TEMPLATE_NAME = "reset-password-2fa-auth-app/index.njk";
export function resetPassword2FAAuthAppGet(): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    res.render(TEMPLATE_NAME, {});
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
      req.ip,
      persistentSessionId,
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

      const path = getErrorPathByCode(result.data.code);

      if (path) {
        return res.redirect(path);
      }

      throw new BadRequestError(result.data.message, result.data.code);
    }
    return res.redirect(
      getNextPathAndUpdateJourney(
        req,
        req.path,
        USER_JOURNEY_EVENTS.MFA_CODE_VERIFIED,
        {
          isIdentityRequired: req.session.user.isIdentityRequired,
        },
        res.locals.sessionId
      )
    );
  };
}
