import { Request, Response } from "express";
import { getNextPathByState } from "../constants";
import {
  formatValidationError,
  renderBadRequest,
} from "../../../utils/validation";
import { BadRequestError } from "../../../utils/error";
import { VerifyCodeInterface } from "./types";
import { ExpressRouteFunc } from "../../../types";

interface Config {
  notificationType: string;
  template: string;
  validationKey: string;
  validationState: string;
  callback?: (req: Request, res: Response, state: string) => void;
}

export function verifyCodePost(
  service: VerifyCodeInterface,
  options: Config
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const code = req.body["code"];
    const sessionId = res.locals.sessionId;
    const clientSessionId = res.locals.clientSessionId;

    const result = await service.verifyCode(
      sessionId,
      code,
      options.notificationType,
      clientSessionId,
      req.ip
    );

    if (!result.success && !result.sessionState) {
      throw new BadRequestError(result.code, result.message);
    }

    if (result.sessionState === options.validationState) {
      const error = formatValidationError("code", req.t(options.validationKey));
      return renderBadRequest(res, req, options.template, error);
    }

    if (options.callback) {
      return options.callback(req, res, result.sessionState);
    }

    res.redirect(getNextPathByState(result.sessionState));
  };
}
