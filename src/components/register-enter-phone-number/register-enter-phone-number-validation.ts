import { body } from "express-validator";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware";

export function validateEnterPhoneNumberRequest() {
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
