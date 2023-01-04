import { Response, Request } from "express";
import {
  HTTP_STATUS_CODES,
  ZENDESK_FIELD_MAX_LENGTH,
  PLACEHOLDER_REPLACEMENTS,
} from "../app.constants";
import { Error } from "../types";

export const isObjectEmpty = (obj: Record<string, unknown>): boolean => {
  return Object.keys(obj).length === 0;
};

export function formatValidationError(
  key: string,
  validationMessage: string
): { [k: string]: Error } {
  const error: { [k: string]: Error } = {};
  error[key] = {
    text: validationMessage,
    href: `#${key}`,
  };
  return error;
}

export function replaceErrorMessagePlaceholders(errors: { [k: string]: Error }): {
  [p: string]: Error;
} {
  for (const error in errors) {
    PLACEHOLDER_REPLACEMENTS.forEach((i) => {
      errors[error].text = errors[error].text?.replace(
        i.search,
        `${i.replacement}`
      );
    });
  }
  return errors;
}

export function renderBadRequest(
  res: Response,
  req: Request,
  template: string,
  errors: { [k: string]: Error },
  postValidationLocals?: Record<string, unknown>
): void {
  res.status(HTTP_STATUS_CODES.BAD_REQUEST);

  errors = replaceErrorMessagePlaceholders(errors);

  const errorValues = Object.values(errors);
  const uniqueErrorList = [
    ...new Map(errorValues.map((error) => [error.text, error])).values(),
  ];
  const errorParams = {
    errors,
    errorList: uniqueErrorList,
    ...req.body,
    language: req.i18n.language,
    zendeskFieldMaxLength: ZENDESK_FIELD_MAX_LENGTH,
  };
  const params = postValidationLocals
    ? { ...errorParams, ...postValidationLocals }
    : errorParams;
  return res.render(template, params);
}
