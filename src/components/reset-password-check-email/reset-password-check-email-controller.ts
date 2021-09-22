import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import { ResetPasswordCheckEmailServiceInterface } from "./types";
import { resetPasswordCheckEmailService } from "./reset-password-check-email-service";
import { ERROR_CODES } from "../../app.constants";

export function resetPasswordCheckEmailGet(
  service: ResetPasswordCheckEmailServiceInterface = resetPasswordCheckEmailService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { email } = req.session.user;
    const sessionId = res.locals.sessionId;
    const result = await service.resetPasswordRequest(email, sessionId);

    if (result.success) {
      return res.render("reset-password-check-email/index.njk", {
        email,
      });
    }

    if (result.code === ERROR_CODES.REQUEST_MISSING_PARAMETERS) {
      throw new Error("Reset password request invalid: missing parameters");
    }

    const errorTemplate =
      result.code === "1022"
        ? "reset-password-check-email/index-exceeded-request-count.njk"
        : "reset-password-check-email/index-request-attempt-blocked.njk";

    return res.render(errorTemplate);
  };
}
