import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import { PATH_NAMES } from "../../app.constants";
import { ResetPasswordServiceInterface } from "./types";
import { resetPasswordService } from "./reset-password-service";
import {
  formatValidationError,
  renderBadRequest,
} from "../../utils/validation";
import xss from "xss";
import { ERROR_CODES, getNextPathAndUpdateJourney } from "../common/constants";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";

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

  if (code && isCodeExpired(code)) {
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

    let resetCode = null;
    let sessionId = null;
    let persistentSessionId = null;

    if (code) {
      if (
        isCodeExpired(code) ||
        !getSessionId(code) ||
        !getPersistentSessionId(code)
      ) {
        return res.redirect(PATH_NAMES.RESET_PASSWORD_EXPIRED_LINK);
      }
      resetCode = getCode(code);
      sessionId = getSessionId(code);
      persistentSessionId = getPersistentSessionId(code);
    } else {
      sessionId = res.locals.sessionId;
      persistentSessionId = res.locals.persistentSessionId;
    }

    const response = await service.updatePassword(
      newPassword,
      resetCode,
      req.ip,
      sessionId,
      persistentSessionId
    );

    if (response.success) {
      return res.redirect(
        getNextPathAndUpdateJourney(
          req,
          req.path,
          USER_JOURNEY_EVENTS.PASSWORD_CREATED,
          {
            isIdentityRequired: req.session.user.isIdentityRequired,
            isConsentRequired: req.session.user.isConsentRequired,
            isLatestTermsAndConditionsAccepted:
              req.session.user.isLatestTermsAndConditionsAccepted,
          },
          res.locals.sessionId
        )
      );
    }

    if (response.data.code === ERROR_CODES.NEW_PASSWORD_SAME_AS_EXISTING) {
      const error = formatValidationError(
        "password",
        req.t("pages.resetPassword.password.validationError.samePassword")
      );
      return renderBadRequest(res, req, resetPasswordTemplate, error);
    }

    return res.redirect(PATH_NAMES.RESET_PASSWORD_EXPIRED_LINK);
  };
}

export function resetPasswordRequestGet(req: Request, res: Response): void {
  return res.redirect(
    getNextPathAndUpdateJourney(
      req,
      req.path,
      USER_JOURNEY_EVENTS.PASSWORD_RESET_REQUESTED,
      null,
      res.locals.sessionId
    )
  );
}

export function resetPasswordExpiredLinkGet(req: Request, res: Response): void {
  res.render("reset-password/index-expired.njk");
}
