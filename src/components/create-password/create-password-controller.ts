import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import { createPasswordService } from "./create-password-service";
import { CreatePasswordServiceInterface } from "./types";
import { BadRequestError } from "../../utils/error";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";
import { ERROR_CODES, getNextPathAndUpdateJourney } from "../common/constants";
import {
  formatValidationError,
  renderBadRequest,
} from "../../utils/validation";

export function createPasswordGet(req: Request, res: Response): void {
  res.render("create-password/index.njk");
}

export function createPasswordPost(
  service: CreatePasswordServiceInterface = createPasswordService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const result = await service.signUpUser(
      res.locals.sessionId,
      res.locals.clientSessionId,
      req.session.user.email,
      req.body.password,
      req.ip,
      res.locals.persistentSessionId
    );

    if (!result.success) {
      if (result.data.code === ERROR_CODES.PASSWORD_IS_COMMON) {
        const error = formatValidationError(
          "password",
          req.t("pages.createPassword.password.validationError.commonPassword")
        );
        return renderBadRequest(res, req, "create-password/index.njk", error);
      }
      throw new BadRequestError(result.data.message, result.data.code);
    }

    req.session.user.isConsentRequired = result.data.consentRequired;

    return res.redirect(
      getNextPathAndUpdateJourney(
        req,
        req.path,
        USER_JOURNEY_EVENTS.PASSWORD_CREATED,
        {
          requiresTwoFactorAuth: true,
        },
        res.locals.sessionId
      )
    );
  };
}
