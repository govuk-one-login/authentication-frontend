import { body } from "express-validator";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware";
import { ValidationChainFunc } from "../../types";
import {
  containsNumbersOrSpacesOnly, containsUKMobileNumber, lengthInRangeWithoutSpaces,
} from "../../utils/phone-number";

export function validateEnterPhoneNumberRequest(): ValidationChainFunc {
  return [
    body("phoneNumber")
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t(
          "pages.enterPhoneNumber.phoneNumber.validationError.required",
          { value }
        );
      })
      .custom((value, { req }) => {
        if (!containsNumbersOrSpacesOnly(value)) {
          throw new Error(
            req.t("pages.enterPhoneNumber.phoneNumber.validationError.numeric")
          );
        }
        return true;
      })
      .custom((value, { req }) => {
        if (!lengthInRangeWithoutSpaces(value, 10, 11)) {
          throw new Error(
            req.t(
              "pages.enterPhoneNumber.phoneNumber.validationError.length"
            )
          );
        }
        return true;
      })
      .custom((value, { req }) => {
        if (!containsUKMobileNumber(value)) {
          throw new Error(
            req.t(
              "pages.enterPhoneNumber.phoneNumber.validationError.international"
            )
          );
        }
        return true;
      }),
    validateBodyMiddleware("enter-phone-number/index.njk"),
  ];
}
