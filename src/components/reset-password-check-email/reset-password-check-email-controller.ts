import type { Request, Response } from "express";
import type { ExpressRouteFunc, MfaMethod } from "../../types.js";
import { MfaMethodPriority } from "../../types.js";
import type { ResetPasswordCheckEmailServiceInterface } from "./types.js";
import { resetPasswordCheckEmailService } from "./reset-password-check-email-service.js";
import { BadRequestError } from "../../utils/error.js";
import {
  ERROR_CODES,
  getErrorPathByCode,
  type SecurityCodeErrorType,
} from "../common/constants.js";
import type { VerifyCodeInterface } from "../common/verify-code/types.js";
import { codeService } from "../common/verify-code/verify-code-service.js";
import { verifyCodePost } from "../common/verify-code/verify-code-controller.js";
import {
  JOURNEY_TYPE,
  MFA_METHOD_TYPE,
  NOTIFICATION_TYPE,
} from "../../app.constants.js";
import type { AccountInterventionsInterface } from "../account-intervention/types.js";
import { accountInterventionService } from "../account-intervention/account-intervention-service.js";
import { isLocked } from "../../utils/lock-helper.js";
import xss from "xss";
import { getNewCodePath } from "../security-code-error/security-code-error-controller.js";
import type { MfaServiceInterface } from "../common/mfa/types.js";
import { mfaService } from "../common/mfa/mfa-service.js";

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
        res.locals.clientSessionId,
        res.locals.persistentSessionId,
        req.session.user.withinForcedPasswordResetJourney,
        req
      );
    }

    if (isLocked(req.session.user.wrongCodeEnteredPasswordResetLock)) {
      const newCodeLink = req.query?.isResendCodeRequest
        ? "/security-code-check-time-limit?isResendCodeRequest=true"
        : "/security-code-check-time-limit";
      return res.render(
        "security-code-error/index-security-code-entered-exceeded.njk",
        {
          newCodeLink,
          show2HrScreen: true,
        }
      );
    }

    if (result.success) {
      req.session.user.activeMfaMethodId = result.data.mfaMethods.find(
        (method: MfaMethod) => method.priority === MfaMethodPriority.DEFAULT
      )?.id;
      req.session.user.mfaMethods = result.data.mfaMethods;

      req.session.user.enterEmailMfaType = result.data.mfaMethodType;
    }

    if (!requestCode || result.success) {
      return res.render(TEMPLATE_NAME, {
        currentPath: req.originalUrl,
        ...resetPasswordCheckEmailTemplateParametersFromRequest(req),
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
        show2HrScreen: true,
        contentId: "",
      });
    } else {
      throw new BadRequestError(result.data.message, result.data.code);
    }
  };
}

export function resetPasswordCheckEmailPost(
  service: VerifyCodeInterface = codeService(),
  accountInterventionsService: AccountInterventionsInterface = accountInterventionService(),
  mfaCodeService: MfaServiceInterface = mfaService()
): ExpressRouteFunc {
  return verifyCodePost(service, accountInterventionsService, {
    notificationType: NOTIFICATION_TYPE.RESET_PASSWORD_WITH_CODE,
    template: TEMPLATE_NAME,
    validationKey:
      "pages.resetPasswordCheckEmail.code.validationError.invalidCode",
    validationErrorCode: ERROR_CODES.RESET_PASSWORD_INVALID_CODE,
    postValidationLocalsProvider:
      resetPasswordCheckEmailTemplateParametersFromRequest,
    beforeSuccessRedirectCallback: async (req, res) => {
      const { email, mfaMethods, activeMfaMethodId } = req.session.user;
      const { sessionId, clientSessionId, persistentSessionId } = res.locals;

      const activeMfaMethod = (mfaMethods ?? []).find(
        (method: MfaMethod) => method.id === activeMfaMethodId
      );
      if (!activeMfaMethod || activeMfaMethod.type !== MFA_METHOD_TYPE.SMS)
        return false;

      const mfaResponse = await mfaCodeService.sendMfaCode(
        sessionId,
        clientSessionId,
        email,
        persistentSessionId,
        false,
        xss(req.cookies.lng as string),
        req,
        req.session.user.activeMfaMethodId,
        JOURNEY_TYPE.PASSWORD_RESET_MFA
      );

      if (mfaResponse.success) return false;

      if (mfaResponse.data.code == ERROR_CODES.MFA_CODE_REQUESTS_BLOCKED) {
        res.render("security-code-error/index-wait.njk", {
          newCodeLink: getNewCodePath(
            req.query.actionType as SecurityCodeErrorType
          ),
          isAccountCreationJourney: false,
        });
        return true;
      }
      if (mfaResponse.data.code == ERROR_CODES.ENTERED_INVALID_MFA_MAX_TIMES) {
        res.render(
          "security-code-error/index-security-code-entered-exceeded.njk",
          {
            newCodeLink: getNewCodePath(
              req.query.actionType as SecurityCodeErrorType
            ),
            show2HrScreen: true,
            isAccountCreationJourney: false,
          }
        );
        return true;
      }
      const path = getErrorPathByCode(mfaResponse.data.code);
      if (path) {
        res.redirect(path);
        return true;
      }
      throw new BadRequestError(
        mfaResponse.data.message,
        mfaResponse.data.code
      );
    },
  });
}

export function resetPasswordResendCodeGet(req: Request, res: Response): void {
  res.render(
    "reset-password-check-email/index-reset-password-resend-code.njk",
    {
      email: req.session.user.email,
    }
  );
}

export function resetPasswordCheckEmailTemplateParametersFromRequest(
  req: Request
): Record<string, unknown> {
  return {
    email: req.session.user.email.toLowerCase(),
    isForcedPasswordResetJourney:
      req.session.user.withinForcedPasswordResetJourney ?? false,
  };
}
