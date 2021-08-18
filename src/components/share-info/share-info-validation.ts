import { body } from "express-validator";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware";
import { ValidationChainFunc } from "../../types";

export function validateShareInfoRequest(): ValidationChainFunc {
  return [
    body("consentValue")
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t("pages.shareInfo.radios.radioText.errorMessage", {
          value,
        });
      }),
    validateBodyMiddleware("share-info/index.njk"),
  ];
}
