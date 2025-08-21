import type { Request, Response } from "express";
import type { ExpressRouteFunc } from "../../types.js";
import type { ResetPasswordServiceInterface } from "./types.js";
import { resetPasswordService } from "./reset-password-service.js";
import {
  formatValidationError,
  renderBadRequest,
} from "../../utils/validation.js";
import {
  ERROR_CODES,
} from "../common/constants.js";
import { getNextPathAndUpdateJourney } from "../common/state-machine/state-machine-executor.js";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine.js";
import { BadRequestError } from "../../utils/error.js";
import type { EnterPasswordServiceInterface } from "../enter-password/types.js";
import { enterPasswordService } from "../enter-password/enter-password-service.js";
import { upsertDefaultSmsMfaMethod } from "../../utils/mfa.js";

const resetPasswordTemplate = "reset-password/index.njk";

export function resetPasswordGet(req: Request, res: Response): void {
  res.render(resetPasswordTemplate);
}

export function resetPasswordRequiredGet(req: Request, res: Response): void {
  res.render(resetPasswordTemplate, {
    isPasswordChangeRequired: req.session.user.isPasswordChangeRequired,
  });
}

export function resetPasswordPost(
  resetService: ResetPasswordServiceInterface = resetPasswordService(),
  loginService: EnterPasswordServiceInterface = enterPasswordService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { email, withinForcedPasswordResetJourney } = req.session.user;
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;
    const newPassword = req.body.password;

    const updatePasswordResponse = await resetService.updatePassword(
      newPassword,
      sessionId,
      clientSessionId,
      persistentSessionId,
      withinForcedPasswordResetJourney,
      req
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
        return renderBadRequest(res, req, resetPasswordTemplate, error, {
          isPasswordChangeRequired: req.session.user.isPasswordChangeRequired,
        });
      }
      if (updatePasswordResponse.data.code === ERROR_CODES.PASSWORD_IS_COMMON) {
        const error = formatValidationError(
          "password",
          req.t("pages.createPassword.password.validationError.commonPassword")
        );
        return renderBadRequest(res, req, resetPasswordTemplate, error, {
          isPasswordChangeRequired: req.session.user.isPasswordChangeRequired,
        });
      } else {
        throw new BadRequestError(
          updatePasswordResponse.data.message,
          updatePasswordResponse.data.code
        );
      }
    }

    req.session.user.passwordResetTime = Date.now();

    const loginResponse = await loginService.loginUser(
      sessionId,
      email,
      newPassword,
      clientSessionId,
      persistentSessionId,
      req
    );

    if (!loginResponse.success) {
      throw new BadRequestError(
        loginResponse.data.message,
        loginResponse.data.code
      );
    }

    req.session.user.mfaMethods = upsertDefaultSmsMfaMethod(
      req.session.user.mfaMethods,
      { redactedPhoneNumber: loginResponse.data.redactedPhoneNumber }
    );
    req.session.user.isLatestTermsAndConditionsAccepted =
      loginResponse.data.latestTermsAndConditionsAccepted;
    req.session.user.isAccountPartCreated =
      !loginResponse.data.mfaMethodVerified;
    if (req.session.user.isPasswordChangeRequired) {
      req.session.user.isPasswordChangeRequired = false;
    }

    return res.redirect(
      await getNextPathAndUpdateJourney(
        req,
        res,
        USER_JOURNEY_EVENTS.PASSWORD_CREATED,
        {
          isIdentityRequired: req.session.user.isIdentityRequired,
          requiresTwoFactorAuth: false,
          isLatestTermsAndConditionsAccepted:
            req.session.user.isLatestTermsAndConditionsAccepted,
          mfaMethodType: loginResponse.data.mfaMethodType,
          isMfaMethodVerified: loginResponse.data.mfaMethodVerified,
        },
      )
    );
  };
}

export async function resetPasswordRequestGet(
  req: Request,
  res: Response
): Promise<void> {
  return res.redirect(
    await getNextPathAndUpdateJourney(
      req,
      res,
      USER_JOURNEY_EVENTS.PASSWORD_RESET_REQUESTED,
    )
  );
}
