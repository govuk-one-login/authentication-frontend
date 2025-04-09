import type { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { isObjectEmpty, renderBadRequest } from "../utils/validation.js";
import { isReauth, isUpliftRequired } from "../utils/request.js";
export const validationErrorFormatter = ({
  msg,
  param,
}: {
  msg: string;
  param: string;
}): any => {
  return {
    text: msg,
    href: `#${param}`,
  };
};

export function validateBodyMiddleware(
  template: string,
  postValidationLocals?: (req: Request) => Record<string, unknown>
) {
  return (req: Request, res: Response, next: NextFunction): any => {
    const errors = validationResult(req)
      .formatWith(validationErrorFormatter)
      .mapped();

    const locals =
      typeof postValidationLocals !== "undefined"
        ? postValidationLocals(req)
        : undefined;
    if (!isObjectEmpty(errors)) {
      return renderBadRequest(res, req, template, errors, locals);
    }
    next();
  };
}

export function validateBodyMiddlewareUpliftTemplate(
  upliftTemplate: string,
  defaultTemplate: string,
  postValidationLocals?: (req: Request) => Record<string, unknown>
) {
  return (req: Request, res: Response, next: NextFunction): any => {
    const template = isUpliftRequired(req) ? upliftTemplate : defaultTemplate;

    const errors = validationResult(req)
      .formatWith(validationErrorFormatter)
      .mapped();

    const locals =
      typeof postValidationLocals !== "undefined"
        ? postValidationLocals(req)
        : undefined;
    if (!isObjectEmpty(errors)) {
      return renderBadRequest(res, req, template, errors, locals);
    }
    next();
  };
}

export function validateBodyMiddlewareReauthTemplate(
  reAuthTemplate: string,
  defaultTemplate: string,
  postValidationLocals?: (req: Request) => Record<string, unknown>
) {
  return (req: Request, res: Response, next: NextFunction): any => {
    const template = isReauth(req) ? reAuthTemplate : defaultTemplate;

    const errors = validationResult(req)
      .formatWith(validationErrorFormatter)
      .mapped();

    const locals =
      typeof postValidationLocals !== "undefined"
        ? postValidationLocals(req)
        : undefined;
    if (!isObjectEmpty(errors)) {
      return renderBadRequest(res, req, template, errors, locals);
    }
    next();
  };
}
