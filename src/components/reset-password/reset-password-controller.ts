import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import { PATH_NAMES, ERROR_CODES } from "../../app.constants";
import { ResetPasswordServiceInterface } from "./types";
import { resetPasswordService } from "./reset-password-service";
import {
  formatValidationError,
  renderBadRequest,
} from "../../utils/validation";
import xss from "xss";

const resetPasswordTemplate = "reset-password/index.njk";

function isCodeExpired(code: string): boolean {
  if (!code) {
    return true;
  }

  const codeExpiry = code.split(".")[1];
  const codeAsNumber = Number(codeExpiry);

  if (isNaN(codeAsNumber)) {
    return true;
  }

  return Date.now() > codeAsNumber;
}

function getCode(code: string): string {
  return code.split(".")[0];
}

function getSessionId(code: string): string {
  return code.split(".")[2];
}

function getPersistentSessionId(code: string): string {
  return code.split(".")[3];
}

export function resetPasswordGet(req: Request, res: Response): void {
  const code = xss(req.query.code as string);

  if (!code || isCodeExpired(code)) {
    return res.render("reset-password/index-invalid.njk");
  }

  res.render(resetPasswordTemplate, { code: code });
}

export function resetPasswordPost(
  service: ResetPasswordServiceInterface = resetPasswordService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const code = req.body.code;
    const newPassword = req.body.password;

    if (
      isCodeExpired(code) ||
      !getSessionId(code) ||
      !getPersistentSessionId(code)
    ) {
      return res.redirect(PATH_NAMES.RESET_PASSWORD_EXPIRED_LINK);
    }

    const response = await service.updatePassword(
      newPassword,
      getCode(code),
      req.ip,
      getSessionId(code),
      getPersistentSessionId(code)
    );

    if (response.success) {
      return res.redirect(PATH_NAMES.RESET_PASSWORD_CONFIRMATION);
    }

    if (response.code === ERROR_CODES.NEW_PASSWORD_SAME_AS_EXISTING) {
      const error = formatValidationError(
        "password",
        req.t("pages.resetPassword.password.validationError.samePassword")
      );
      return renderBadRequest(res, req, resetPasswordTemplate, error);
    }

    return res.redirect(PATH_NAMES.RESET_PASSWORD_EXPIRED_LINK);
  };
}

export function resetPasswordConfirmationGet(
  req: Request,
  res: Response
): void {
  res.render("reset-password/index-confirmation.njk");
}

export function resetPasswordExpiredLinkGet(req: Request, res: Response): void {
  res.render("reset-password/index-expired.njk");
}
