import { Request, Response } from "express";
import { getNextPathRateLimit } from "../constants";
import {
  formatValidationError,
  renderBadRequest,
} from "../../../utils/validation";
import { BadRequestError } from "../../../utils/error";
import { VerifyCodeInterface } from "./types";
import { ExpressRouteFunc } from "../../../types";

interface Config {
  notificationType: string;
  successPath: string;
  template: string;
  validationKey: string;
  validationState: string;
}

export function verifyCodePost(
  service: VerifyCodeInterface,
  options: Config
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const code = req.body["code"];
    const sessionId = res.locals.sessionId;

    const result = await service.verifyCode(
      sessionId,
      code,
      options.notificationType,
      req.ip
    );

    if (result.success) {
      return res.redirect(options.successPath);
    }

    if (result.sessionState) {
      if (result.sessionState === options.validationState) {
        const error = formatValidationError(
          "code",
          req.t(options.validationKey)
        );
        return renderBadRequest(res, req, options.template, error);
      }
      return res.redirect(getNextPathRateLimit(result.sessionState));
    } else {
      throw new BadRequestError(result.message, result.code);
    }
  };
}
