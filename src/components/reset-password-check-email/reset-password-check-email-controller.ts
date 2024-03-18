import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import { ResetPasswordCheckEmailServiceInterface } from "./types";
import { resetPasswordCheckEmailService } from "./reset-password-check-email-service";
import { ERROR_CODES, getErrorPathByCode } from "../common/constants";
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

    if (!requestCode || result.success) {
      const support2FABeforePasswordResetFlag = support2FABeforePasswordReset();
      return res.render(TEMPLATE_NAME, {
        support2FABeforePasswordResetFlag,
        email,
      });
    }

    return res.redirect(getErrorPathByCode(result.data.code));
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
