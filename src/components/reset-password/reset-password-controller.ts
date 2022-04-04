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

const resetPasswordTemplate = "reset-password/index.njk";

export function resetPasswordGet(req: Request, res: Response): void {
  res.render(resetPasswordTemplate);
}

export function resetPasswordPost(
  service: ResetPasswordServiceInterface = resetPasswordService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {

    const newPassword = req.body.password;
    const sessionId = res.locals.sessionId;
    const persistentSessionId = res.locals.persistentSessionId;

    const response = await service.updatePassword(
      newPassword,
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

    throw new BadRequestError(response.data.message, response.data.code);
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
