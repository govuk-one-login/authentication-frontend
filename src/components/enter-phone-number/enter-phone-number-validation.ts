import { body } from "express-validator";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware.js";
import { ValidationChainFunc } from "../../types.js";
import {
  internationalPhoneNumberMustBeValid,
  internationalPhoneNumberMustContainLeadingPlusNumbersOrSpacesOnly,
  internationalPhoneNumberMustHaveLengthWithoutSpacesInRange,
  ukPhoneNumberMustBeValid,
  ukPhoneNumberMustContainLeadingPlusNumbersOrSpacesOnly,
  ukPhoneNumberMustHaveLengthWithoutSpacesInRange,
} from "../common/phone-number/phone-number-validation.js";
export function validateEnterPhoneNumberRequest(): ValidationChainFunc {
  return [
    body("phoneNumber")
      .if(body("hasInternationalPhoneNumber").not().equals("true"))
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t(
          "sharedFields.phoneNumber.ukPhoneNumber.validationError.required",
          {
            value,
          }
        );
      })
      .custom(ukPhoneNumberMustContainLeadingPlusNumbersOrSpacesOnly)
      .custom(ukPhoneNumberMustHaveLengthWithoutSpacesInRange)
      .custom(ukPhoneNumberMustBeValid),
    body("internationalPhoneNumber")
      .if(body("hasInternationalPhoneNumber").notEmpty().equals("true"))
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t(
          "sharedFields.phoneNumber.internationalPhoneNumber.validationError.required",
          { value }
        );
      })
      .custom(internationalPhoneNumberMustContainLeadingPlusNumbersOrSpacesOnly)
      .custom(internationalPhoneNumberMustHaveLengthWithoutSpacesInRange)
      .custom(internationalPhoneNumberMustBeValid),
    validateBodyMiddleware("enter-phone-number/index.njk"),
  ];
}
