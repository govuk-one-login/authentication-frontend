import type { NextFunction, Request, Response } from "express";
import {
  validationResult,
  type ErrorFormatter,
  type ValidationError,
} from "express-validator";
import { isObjectEmpty, renderBadRequest } from "../utils/validation.js";
import { isReauth, isUpliftRequired } from "../utils/request.js";

export const validationErrorFormatter: ErrorFormatter = (
  error: ValidationError
) => {
  switch (error.type) {
    case "field":
      return {
        text: error.msg,
        href: `#${error.path}`,
      };
    case "alternative":
    case "alternative_grouped":
      return error.msg;
    case "unknown_fields": {
      const fields = error.fields.map((field) => field.path).join(", ");
      return `Unknown fields found, please remove them: ${fields}`;
    }
    default:
      throw new Error(`Not a known express-validator error: ${error}`);
  }
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
