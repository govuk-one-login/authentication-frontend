import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import { ResetPasswordServiceInterface } from "./types";
import { resetPasswordService } from "./reset-password-service";
import {
  formatValidationError,
  renderBadRequest,
} from "../../utils/validation";
import {
  ERROR_CODES,
  getErrorPathByCode,
  getNextPathAndUpdateJourney,
} from "../common/constants";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";
import { BadRequestError } from "../../utils/error";
import { EnterPasswordServiceInterface } from "../enter-password/types";
import { enterPasswordService } from "../enter-password/enter-password-service";
import { MfaServiceInterface } from "../common/mfa/types";
import { mfaService } from "../common/mfa/mfa-service";
import { MFA_METHOD_TYPE } from "../../app.constants";

const resetPasswordTemplate = "reset-password/index.njk";

export function resetPasswordGet(req: Request, res: Response): void {
  res.render(resetPasswordTemplate);
}

export function resetPasswordPost(
  resetService: ResetPasswordServiceInterface = resetPasswordService(),
  loginService: EnterPasswordServiceInterface = enterPasswordService(),
  mfaCodeService: MfaServiceInterface = mfaService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { email } = req.session.user;
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;
    const newPassword = req.body.password;

    const updatePasswordResponse = await resetService.updatePassword(
      newPassword,
      req.ip,
      sessionId,
      persistentSessionId
    );

    if (!updatePasswordResponse.success) {
      if (
        updatePasswordResponse.data.code ===
        ERROR_CODES.NEW_PASSWORD_SAME_AS_EXISTING
      ) {
        const error = formatValidationError(
          "password",
          req.t("pages.resetPassword.password.validationError.samePassword")
        );
        return renderBadRequest(res, req, resetPasswordTemplate, error);
      }
      if (updatePasswordResponse.data.code === ERROR_CODES.PASSWORD_IS_COMMON) {
        const error = formatValidationError(
          "password",
          req.t("pages.createPassword.password.validationError.commonPassword")
        );
        return renderBadRequest(res, req, resetPasswordTemplate, error);
      } else {
        throw new BadRequestError(
          updatePasswordResponse.data.message,
          updatePasswordResponse.data.code
        );
      }
    }

    const loginResponse = await loginService.loginUser(
      sessionId,
      email,
      newPassword,
      clientSessionId,
      req.ip,
      persistentSessionId
    );

    if (!loginResponse.success) {
      throw new BadRequestError(
        loginResponse.data.message,
        loginResponse.data.code
      );
    }

    req.session.user.phoneNumber = loginResponse.data.redactedPhoneNumber;
    req.session.user.isConsentRequired = loginResponse.data.consentRequired;
    req.session.user.isLatestTermsAndConditionsAccepted =
      loginResponse.data.latestTermsAndConditionsAccepted;
    req.session.user.isAccountPartCreated =
      !loginResponse.data.mfaMethodVerified;

    if (
      loginResponse.data.mfaMethodVerified &&
      loginResponse.data.mfaMethodType === MFA_METHOD_TYPE.SMS
    ) {
      const mfaResponse = await mfaCodeService.sendMfaCode(
        sessionId,
        clientSessionId,
        email,
        req.ip,
        persistentSessionId,
        false
      );

      if (!mfaResponse.success) {
        const path = getErrorPathByCode(mfaResponse.data.code);
        if (path) {
          return res.redirect(path);
        }
        throw new BadRequestError(
          mfaResponse.data.message,
          mfaResponse.data.code
        );
      }
    }

    return res.redirect(
      getNextPathAndUpdateJourney(
        req,
        req.path,
        USER_JOURNEY_EVENTS.PASSWORD_CREATED,
        {
          isConsentRequired: req.session.user.isConsentRequired,
          requiresTwoFactorAuth: true,
          isLatestTermsAndConditionsAccepted:
            req.session.user.isLatestTermsAndConditionsAccepted,
          mfaMethodType: loginResponse.data.mfaMethodType,
          isMfaMethodVerified: loginResponse.data.mfaMethodVerified,
        },
        res.locals.sessionId
      )
    );
  };
}

export function resetPasswordRequestGet(req: Request, res: Response): void {
  return res.redirect(
    getNextPathAndUpdateJourney(
      req,
      req.path,
      USER_JOURNEY_EVENTS.PASSWORD_RESET_REQUESTED,
      null,
      res.locals.sessionId
    )
  );
}
