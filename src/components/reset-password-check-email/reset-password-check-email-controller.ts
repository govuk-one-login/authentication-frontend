import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import { ResetPasswordCheckEmailServiceInterface } from "./types";
import { resetPasswordCheckEmailService } from "./reset-password-check-email-service";
import { ERROR_CODES } from "../../app.constants";
import { BadRequestError } from "../../utils/error";

export function resetPasswordCheckEmailGet(
  service: ResetPasswordCheckEmailServiceInterface = resetPasswordCheckEmailService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { email } = req.session.user;
    const sessionId = res.locals.sessionId;
    const result = await service.resetPasswordRequest(email, sessionId, req.ip);

    if (result.success) {
      return res.render("reset-password-check-email/index.njk", {
        email,
      });
    }

    if (
      result.code === ERROR_CODES.RESET_PASSWORD_LINK_MAX_RETRIES_REACHED ||
      result.code === ERROR_CODES.RESET_PASSWORD_LINK_BLOCKED
    ) {
      const errorTemplate =
        result.code === ERROR_CODES.RESET_PASSWORD_LINK_MAX_RETRIES_REACHED
          ? "reset-password-check-email/index-exceeded-request-count.njk"
          : "reset-password-check-email/index-request-attempt-blocked.njk";

      return res.render(errorTemplate);
    } else {
      throw new BadRequestError(result.message, result.code);
    }
  };
}
