import { body } from "express-validator";
import { validateBodyMiddleware } from "../../../middleware/form-validation-middleware.js";
import type { ValidationChainFunc } from "../../../types.js";
import { getThemeRadioButtonsFromStructure } from "../structure/contact-us-structure-utils.js";
import { CONTACT_FORM_STRUCTURE } from "../structure/contact-us-structure.js";

export function validateContactUsRequest(
  template: string,
  bodyType: string
): ValidationChainFunc {
  return [
    body(bodyType)
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t("pages.contactUsPublic.section3.errorMessage", {
          value,
        });
      }),
    validateBodyMiddleware(template, postValidationLocals),
  ];
}

const postValidationLocals = function locals(): Record<string, unknown> {
  return {
    radioButtons: getThemeRadioButtonsFromStructure(CONTACT_FORM_STRUCTURE),
  };
};
