import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import { ResetPasswordCheckEmailServiceInterface } from "./types";
import { resetPasswordCheckEmailService } from "./reset-password-check-email-service";
import { BadRequestError } from "../../utils/error";
import { ERROR_CODES } from "../common/constants";

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
      return res.render("reset-password-check-email/index.njk", {
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
