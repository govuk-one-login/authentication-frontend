import { Response, Request } from "express";
import { HTTP_STATUS_CODES } from "../app.constants";

export const isObjectEmpty = (obj: Record<string, unknown>): boolean => {
  return Object.keys(obj).length === 0;
};

export function formatValidationError(
  key: string,
  validationMessage: string
): { [k: string]: any } {
  const error: { [k: string]: any } = {};
  error[key] = {
    text: validationMessage,
    href: `#${key}`,
  };
  return error;
}

export function renderBadRequest(
  res: Response,
  req: Request,
  template: string,
  errors: any
): void {
  res.status(HTTP_STATUS_CODES.BAD_REQUEST);

  res.render(template, {
    errors,
    errorList: Object.values(errors),
    ...req.body,
    language: req.i18n.language,
  });
}
