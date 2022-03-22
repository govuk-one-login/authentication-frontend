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

const TEMPLATE_NAME = "reset-password-check-email/index.njk";

export function resetPasswordCheckEmailGet(
  service: ResetPasswordCheckEmailServiceInterface = resetPasswordCheckEmailService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { email } = req.session.user;
    const sessionId = res.locals.sessionId;
    const result = await service.resetPasswordRequest(
      email,
      sessionId,
      req.ip,
      res.locals.persistentSessionId
    );

    if (result.success) {
      return res.render(TEMPLATE_NAME, {
        email,
      });
    }

    if (
      [
        ERROR_CODES.RESET_PASSWORD_LINK_MAX_RETRIES_REACHED,
        ERROR_CODES.RESET_PASSWORD_LINK_BLOCKED,
      ].includes(result.data.code)
    ) {
      const errorTemplate =
        result.data.code === ERROR_CODES.RESET_PASSWORD_LINK_MAX_RETRIES_REACHED
          ? "reset-password-check-email/index-exceeded-request-count.njk"
          : "reset-password-check-email/index-request-attempt-blocked.njk";

      return res.render(errorTemplate);
    } else {
      throw new BadRequestError(result.data.message, result.data.code);
    }
  };
}

export function resetPasswordCheckEmailPost (
  service: VerifyCodeInterface = codeService()
): ExpressRouteFunc {
  return verifyCodePost(service, {
    notificationType: NOTIFICATION_TYPE.RESET_PASSWORD_WITH_CODE,
    template: TEMPLATE_NAME,
    validationKey: "pages.resetPasswordCheckEmail.code.validationError.invalidCode",
    validationErrorCode: ERROR_CODES.RESET_PASSWORD_INVALID_CODE,
  });
};