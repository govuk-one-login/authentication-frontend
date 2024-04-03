import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import { ResetPasswordCheckEmailServiceInterface } from "./types";
import { resetPasswordCheckEmailService } from "./reset-password-check-email-service";
import { BadRequestError } from "../../utils/error";
import { ERROR_CODES } from "../common/constants";
import { VerifyCodeInterface } from "../common/verify-code/types";
import { codeService } from "../common/verify-code/verify-code-service";
import { verifyCodePost } from "../common/verify-code/verify-code-controller";
import { NOTIFICATION_TYPE } from "../../app.constants";
import { support2FABeforePasswordReset, support2hrLockout } from "../../config";
import { AccountInterventionsInterface } from "../account-intervention/types";
import { accountInterventionService } from "../account-intervention/account-intervention-service";

const TEMPLATE_NAME = "reset-password-check-email/index.njk";

export function resetPasswordCheckEmailGet(
  service: ResetPasswordCheckEmailServiceInterface = resetPasswordCheckEmailService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { email } = req.session.user;
    const sessionId = res.locals.sessionId;
    const requestCode = !(
      req.query.requestCode && req.query.requestCode === "false"
    );
    req.session.user.isPasswordResetJourney = true;
    let result;

    if (requestCode) {
      result = await service.resetPasswordRequest(
        email,
        sessionId,
        req.ip,
        res.locals.clientSessionId,
        res.locals.persistentSessionId
      );
    }

    if (
      req.session.user.wrongCodeEnteredPasswordResetLock &&
      new Date().getTime() <
        new Date(req.session.user.wrongCodeEnteredPasswordResetLock).getTime()
    ) {
      const newCodeLink = req.query?.isResendCodeRequest
        ? "/security-code-check-time-limit?isResendCodeRequest=true"
        : "/security-code-check-time-limit";
      return res.render(
        "security-code-error/index-security-code-entered-exceeded.njk",
        {
          newCodeLink,
          show2HrScreen: support2hrLockout(),
        }
      );
    }

    if (result.success && req.session.user.enterEmailMfaType === undefined) {
      req.session.user.enterEmailMfaType = result.data.mfaMethodType;
      req.session.user.redactedPhoneNumber = result.data.phoneNumberLastThree;
    }

    if (!requestCode || result.success) {
      const support2FABeforePasswordResetFlag = support2FABeforePasswordReset();
      const isForcedPasswordResetJourney =
        req.session.user.withinForcedPasswordResetJourney || false;
      return res.render(TEMPLATE_NAME, {
        support2FABeforePasswordResetFlag,
        isForcedPasswordResetJourney,
        email,
      });
    }

    if (
      [
        ERROR_CODES.RESET_PASSWORD_LINK_MAX_RETRIES_REACHED,
        ERROR_CODES.RESET_PASSWORD_LINK_BLOCKED,
        ERROR_CODES.ENTERED_INVALID_PASSWORD_RESET_CODE_MAX_TIMES,
      ].includes(result.data.code)
    ) {
      let errorTemplate: string;

      if (
        result.data.code === ERROR_CODES.RESET_PASSWORD_LINK_MAX_RETRIES_REACHED
      ) {
        errorTemplate = "security-code-error/index-too-many-requests.njk";
      } else if (
        result.data.code ===
        ERROR_CODES.ENTERED_INVALID_PASSWORD_RESET_CODE_MAX_TIMES
      ) {
        errorTemplate =
          "security-code-error/index-security-code-entered-exceeded.njk";
      } else {
        errorTemplate = "security-code-error/index-wait.njk";
      }

      return res.render(errorTemplate, {
        support2hrLockout: support2hrLockout(),
        show2HrScreen: support2hrLockout(),
      });
    } else {
      throw new BadRequestError(result.data.message, result.data.code);
    }
  };
}

export function resetPasswordCheckEmailPost(
  service: VerifyCodeInterface = codeService(),
  accountInterventionsService: AccountInterventionsInterface = accountInterventionService()
): ExpressRouteFunc {
  return verifyCodePost(service, accountInterventionsService, {
    notificationType: NOTIFICATION_TYPE.RESET_PASSWORD_WITH_CODE,
    template: TEMPLATE_NAME,
    validationKey:
      "pages.resetPasswordCheckEmail.code.validationError.invalidCode",
    validationErrorCode: ERROR_CODES.RESET_PASSWORD_INVALID_CODE,
  });
}

export function resetPasswordResendCodeGet(req: Request, res: Response): void {
  res.render(
    "reset-password-check-email/index-reset-password-resend-code.njk",
    {
      email: req.session.user.email,
      support2hrLockout: support2hrLockout(),
    }
  );
}
