import { Request, Response } from "express";
import {
  HTTP_STATUS_CODES,
  PLACEHOLDER_REPLACEMENTS,
  ZENDESK_FIELD_MAX_LENGTH,
  ZENDESK_COUNTRY_MAX_LENGTH,
} from "../app.constants";
import { Error, PlaceholderReplacement } from "../types";

export const isObjectEmpty = (obj: Record<string, unknown>): boolean => {
  return Object.keys(obj).length === 0;
};

interface RequestBody {
  [key: string]: string | boolean;
}

const convertStringBooleanPropertiesToJavaScriptBoolean = (
  reqBody: RequestBody
): RequestBody => {
  return Object.keys(reqBody).reduce<RequestBody>(
    (reducedObject, reqBodyObjectKey) => {
      const valueInOriginalReqBody = reqBody[reqBodyObjectKey];
      if (valueInOriginalReqBody === "true") {
        reducedObject[reqBodyObjectKey] = true;
      }

      if (valueInOriginalReqBody === "false") {
        reducedObject[reqBodyObjectKey] = false;
      }

      reducedObject[reqBodyObjectKey] = valueInOriginalReqBody;

      return reducedObject;
    },
    {}
  );
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

export function deDuplicateErrorList(errors: { [k: string]: Error }): Error[] {
  const errorValues = Object.values(errors);
  return [
    ...new Map(
      errorValues.map((error) => {
        return [error.text, error];
      })
    ).values(),
  ];
}

export function replaceErrorMessagePlaceholders(
  errors: Error[],
  placeholders: PlaceholderReplacement[]
): Error[] {
  return errors.map((error) => {
    const errorCopy: Error = { ...error };

    placeholders.forEach((placeholder) => {
      if (errorCopy.text?.includes(placeholder.search)) {
        errorCopy.text = errorCopy.text.replace(
          placeholder.search,
          placeholder.replacement
        );
      }
    });

    return errorCopy;
  });
}

export function renderBadRequest(
  res: Response,
  req: Request,
  template: string,
  errors: { [k: string]: Error },
  postValidationLocals?: Record<string, unknown>
): void {
  res.status(HTTP_STATUS_CODES.BAD_REQUEST);

  const uniqueErrorList: Error[] = deDuplicateErrorList(errors);
  const uniqueErrorListWithPlaceholdersReplaced: Error[] =
    replaceErrorMessagePlaceholders(uniqueErrorList, PLACEHOLDER_REPLACEMENTS);

  const errorParams = {
    errors,
    errorList: uniqueErrorListWithPlaceholdersReplaced,
    ...convertStringBooleanPropertiesToJavaScriptBoolean(req.body),
    language: req.i18n.language,
    zendeskFieldMaxLength: ZENDESK_FIELD_MAX_LENGTH,
    zendeskCountryMaxLength: ZENDESK_COUNTRY_MAX_LENGTH,
  };

  const params = postValidationLocals
    ? { ...errorParams, ...postValidationLocals }
    : errorParams;

  return res.render(template, params);
}
