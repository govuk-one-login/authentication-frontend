import { body } from "express-validator";
import { validateBodyMiddleware } from "../../middleware/form-validation-middleware";
import { ValidationChainFunc } from "../../types";
import {
  containsLeadingPlusNumbersOrSpacesOnly,
  containsInternationalMobileNumber,
  containsUKMobileNumber,
  lengthInRangeWithoutSpaces,
} from "../../utils/phone-number";

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
      .custom((value, { req }) => {
        if (!containsLeadingPlusNumbersOrSpacesOnly(value)) {
          throw new Error(
            req.t(
              "sharedFields.phoneNumber.ukPhoneNumber.validationError.plusNumericOnly"
            )
          );
        }
        return true;
      })
      .custom((value, { req }) => {
        if (!lengthInRangeWithoutSpaces(value, 10, 14)) {
          throw new Error(
            req.t(
              "sharedFields.phoneNumber.ukPhoneNumber.validationError.length"
            )
          );
        }
        return true;
      })
      .custom((value, { req }) => {
        if (!containsUKMobileNumber(value)) {
          throw new Error(
            req.t(
              "sharedFields.phoneNumber.ukPhoneNumber.validationError.international"
            )
          );
        }
        return true;
      }),
    body("internationalPhoneNumber")
      .if(body("hasInternationalPhoneNumber").notEmpty().equals("true"))
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t(
          "sharedFields.phoneNumber.internationalPhoneNumber.validationError.required",
          { value }
        );
      })
      .custom((value, { req }) => {
        if (!containsLeadingPlusNumbersOrSpacesOnly(value)) {
          throw new Error(
            req.t(
              "sharedFields.phoneNumber.internationalPhoneNumber.validationError.plusNumericOnly"
            )
          );
        }
        return true;
      })
      .custom((value, { req }) => {
        if (!lengthInRangeWithoutSpaces(value, 5, 26)) {
          throw new Error(
            req.t(
              "sharedFields.phoneNumber.internationalPhoneNumber.validationError.internationalFormat"
            )
          );
        }
        return true;
      })
      .custom((value, { req }) => {
        if (!containsInternationalMobileNumber(value)) {
          throw new Error(
            req.t(
              "sharedFields.phoneNumber.internationalPhoneNumber.validationError.internationalFormat"
            )
          );
        }
        return true;
      }),
    validateBodyMiddleware("enter-phone-number/index.njk"),
  ];
}
