import { body } from "express-validator";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware";
import { ValidationChainFunc } from "../../types";

export function validateContactUsRequest(
  template: string,
  bodyType: string
): ValidationChainFunc {
  return [
    body(bodyType)
      .notEmpty()
      .withMessage((value, { req }) => {
        let errorMessage = "pages.contactUsPublic.section3.errorMessage";
        if (req.body.theme === "signing_in") {
          errorMessage =
            "pages.contactUsFurtherInformation.signingIn.section1.errorMessage";
        } else if (req.body.theme === "account_creation") {
          errorMessage =
            "pages.contactUsFurtherInformation.accountCreation.section1.errorMessage";
        }

        return req.t(errorMessage, {
          value,
        });
      }),
    validateBodyMiddleware(template),
  ];
}
