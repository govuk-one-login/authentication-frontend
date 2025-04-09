import { body } from "express-validator";
import { validateBodyMiddleware } from "../../../middleware/form-validation-middleware.js";
import { ValidationChainFunc } from "../../../types.js";
export function validateSupportRequest(): ValidationChainFunc {
  return [
    body("supportType")
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t("pages.support.section1.supportTypeRadios.errorMessage", {
          value,
        });
      }),
    validateBodyMiddleware("common/footer/support.njk"),
  ];
}
