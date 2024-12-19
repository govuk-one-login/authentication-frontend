import { validateBodyMiddleware } from "../../middleware/form-validation-middleware";
import { ValidationChainFunc } from "../../types";
import { body } from "express-validator";
import { PATH_NAMES } from "../../app.constants";

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
      "ipv-callback/index-cannot-change-how-get-security-codes.njk",
      (req) => ({
        variant:
          req.path === PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES_IDENTITY_FAIL
            ? "identityFailed"
            : "incomplete",
        formPostPath: req.path,
      })
    ),
  ];
}
