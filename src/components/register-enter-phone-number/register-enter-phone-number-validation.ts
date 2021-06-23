import { body } from "express-validator";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware";
import { ValidationChainFunc } from "../../types";

export function validateEnterPhoneNumberRequest(): ValidationChainFunc {
  return [
    body("phoneNumber")
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t(
          "pages.enterPhoneNumber.phoneNumber.validationError.required",
          { value }
        );
      }),
    validateBodyMiddleware("register-enter-phone-number/index.njk"),
  ];
}
