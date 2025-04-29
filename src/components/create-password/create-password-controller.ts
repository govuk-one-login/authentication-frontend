import type { Request, Response } from "express";
import type { ExpressRouteFunc } from "../../types.js";
import { createPasswordService } from "./create-password-service.js";
import type { CreatePasswordServiceInterface } from "./types.js";
import { BadRequestError } from "../../utils/error.js";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine.js";
import {
  ERROR_CODES,
  getNextPathAndUpdateJourney,
} from "../common/constants.js";
import {
  formatValidationError,
  renderBadRequest,
} from "../../utils/validation.js";
export function createPasswordGet(req: Request, res: Response): void {
  return res.render("create-password/index.njk");
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
      res.locals.persistentSessionId,
      req
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

    return res.redirect(
      await getNextPathAndUpdateJourney(
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
