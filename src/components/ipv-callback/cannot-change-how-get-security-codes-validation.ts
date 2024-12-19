import { validateBodyMiddleware } from "../../middleware/form-validation-middleware";
import { ValidationChainFunc } from "../../types";
import { body } from "express-validator";

export function validateCannotChangeHowGetSecurityCodesActionRequest(): ValidationChainFunc {
  return [
    body("cannotChangeHowGetSecurityCodeAction")
      .if(body("cannotChangeHowGetSecurityCodeAction").not().equals("true"))
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t(
          "pages.cannotChangeHowGetSecurityCodeMfaReset.radios.radioValidationError",
          {
            value,
          }
        );
      }),
    validateBodyMiddleware(
      "ipv-callback/index-cannot-change-how-get-security-codes.njk"
    ),
  ];
}
