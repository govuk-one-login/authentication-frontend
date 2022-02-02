import { body } from "express-validator";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware";
import { ValidationChainFunc } from "../../types";

export function validateContactUsRequest(): ValidationChainFunc {
  return [
    body("theme")
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t("pages.contactUsPublic.section3.errorMessage", {
          value,
        });
      }),
    validateBodyMiddleware("contact-us/index-public-contact-us.njk"),
  ];
}
