import { body } from "express-validator";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware";
import { ValidationChainFunc } from "../../types";
import { containsNumbersOnly } from "../../utils/strings";

export function validateSmsCodeRequest(): ValidationChainFunc {
  return [
    body("code")
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t("pages.checkYourPhone.code.validationError.required", {
          value,
        });
      })
      .isLength({ max: 6 })
      .withMessage((value, { req }) => {
        return req.t("pages.checkYourPhone.code.validationError.maxLength", {
          value,
        });
      })
      .isLength({ min: 6 })
      .withMessage((value, { req }) => {
        return req.t("pages.checkYourPhone.code.validationError.minLength", {
          value,
        });
      })
      .custom((value, { req }) => {
        if (!containsNumbersOnly(value)) {
          throw new Error(
            req.t("pages.checkYourPhone.code.validationError.invalidFormat")
          );
        }
        return true;
      }),
    validateBodyMiddleware("check-your-phone/index.njk"),
  ];
}
