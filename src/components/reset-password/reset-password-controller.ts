import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import { ResetPasswordServiceInterface } from "./types";
import { resetPasswordService } from "./reset-password-service";
import {
  formatValidationError,
  renderBadRequest,
} from "../../utils/validation";
import { ERROR_CODES, getNextPathAndUpdateJourney } from "../common/constants";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";
import { BadRequestError } from "../../utils/error";
import { EnterPasswordServiceInterface } from "../enter-password/types";
import { enterPasswordService } from "../enter-password/enter-password-service";
import { supportMfaResetWithIpv } from "../../config";

const resetPasswordTemplate = "reset-password/index.njk";

const oplValues = {
  accountRecovery: {
    contentId: "a95d02f6-6445-4112-b0c2-7a6d4f804b99",
  },
};

export function resetPasswordGet(req: Request, res: Response): void {
  res.render(resetPasswordTemplate, {
    contentId: oplValues.accountRecovery.contentId,
  });
}

export function resetPasswordRequiredGet(req: Request, res: Response): void {
  res.render(resetPasswordTemplate, {
    isPasswordChangeRequired: req.session.user.isPasswordChangeRequired,
    contentId: oplValues.accountRecovery.contentId,
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

    // WARNING! Before removing this feature flag, you first need to ensure that this behaviour is the default on the backend
    // Purely removing this feature flag will mean that we start writing to account modifiers again
    const allowMfaResetAfterPasswordReset = supportMfaResetWithIpv();

    const updatePasswordResponse = await resetService.updatePassword(
      newPassword,
      sessionId,
      clientSessionId,
      persistentSessionId,
      withinForcedPasswordResetJourney,
      allowMfaResetAfterPasswordReset,
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

    req.session.user.redactedPhoneNumber =
      loginResponse.data.redactedPhoneNumber;
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
        req.path,
        USER_JOURNEY_EVENTS.PASSWORD_CREATED,
        {
          isIdentityRequired: req.session.user.isIdentityRequired,
          requiresTwoFactorAuth: false,
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

export async function resetPasswordRequestGet(
  req: Request,
  res: Response
): Promise<void> {
  return res.redirect(
    await getNextPathAndUpdateJourney(
      req,
      req.path,
      USER_JOURNEY_EVENTS.PASSWORD_RESET_REQUESTED,
      null,
      res.locals.sessionId
    )
  );
}
