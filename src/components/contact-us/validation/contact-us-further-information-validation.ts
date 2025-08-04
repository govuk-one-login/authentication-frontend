import type { ValidationChainFunc } from "../../../types.js";
import { body } from "express-validator";
import { validateBodyMiddleware } from "../../../middleware/form-validation-middleware.js";
import { CONTACT_FORM_STRUCTURE } from "../structure/contact-us-structure.js";
import {
  getHeaderFromTheme,
  getLegendFromTheme,
  getThemeRadioButtonsFromStructure,
  getTitleFromTheme,
} from "../structure/contact-us-structure-utils.js";
import type { Request } from "express";

export function getErrorMessage(theme: string): string {
  const pageContent = CONTACT_FORM_STRUCTURE.get(theme).nextPageContent;
  return `${pageContent}.section1.errorMessage`;
}

export function validateContactUsFurtherInformationRequest(
  template: string,
  bodyType: string
): ValidationChainFunc {
  return [
    body(bodyType)
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t(getErrorMessage(req.body.theme), {
          value,
        });
      }),
    validateBodyMiddleware(template, postValidationLocals),
  ];
}

const postValidationLocals = function locals(
  req: Request
): Record<string, unknown> {
  const theme = CONTACT_FORM_STRUCTURE.get(req.body.theme);
  return {
    radioButtons: getThemeRadioButtonsFromStructure(theme.subThemes),
    title: getTitleFromTheme(theme),
    header: getHeaderFromTheme(theme),
    legend: getLegendFromTheme(theme),
  };
};
