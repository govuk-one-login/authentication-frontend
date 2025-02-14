import { NextFunction, Request, Response } from "express";
import { ErrorFormatter, validationResult } from "express-validator";
import { isObjectEmpty, renderBadRequest } from "../utils/validation";

export const validationErrorFormatter: ErrorFormatter = (error) => {
  switch (error.type) {
    case "field":
      return {
        text: error.msg,
        href: `#${error.path}`,
      };
    case "alternative":
    case "alternative_grouped":
      return error.msg;
    case "unknown_fields":
      const fields = error.fields.map((field) => field.path).join(", ");
      return `Unknown fields found, please remove them: ${fields}`;
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
    const { isUpliftRequired } = req.session.user;

    const template = isUpliftRequired ? upliftTemplate : defaultTemplate;

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
    const { reauthenticate } = req.session.user;

    const template = reauthenticate ? reAuthTemplate : defaultTemplate;

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
