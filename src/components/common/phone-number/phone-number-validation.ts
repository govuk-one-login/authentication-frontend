import {
  containsInternationalMobileNumber,
  containsLeadingPlusNumbersOrSpacesOnly,
  containsUKMobileNumber,
  lengthInRangeWithoutSpaces,
} from "../../../utils/phone-number.js";
import { Meta } from "express-validator";

//region Non-country specific validators
const phoneNumberMustContainLeadingPlusNumbersOrSpacesOnly = (
  value: string,
  { req }: Meta,
  errorMessage: string
): boolean => {
  if (!containsLeadingPlusNumbersOrSpacesOnly(value)) {
    throw new Error(req.t(errorMessage));
  }
  return true;
};

const phoneNumberMustHaveLengthWithoutSpacesInRange = (
  value: string,
  { req }: Meta,
  errorMessage: string,
  min: number,
  max: number
): boolean => {
  if (!lengthInRangeWithoutSpaces(value, min, max)) {
    throw new Error(req.t(errorMessage));
  }
  return true;
};
//endregion

//region UK phone number validators
export const ukPhoneNumberMustContainLeadingPlusNumbersOrSpacesOnly = (
  value: string,
  meta: Meta
): boolean => {
  return phoneNumberMustContainLeadingPlusNumbersOrSpacesOnly(
    value,
    meta,
    "sharedFields.phoneNumber.ukPhoneNumber.validationError.plusNumericOnly"
  );
};

export const ukPhoneNumberMustHaveLengthWithoutSpacesInRange = (
  value: string,
  meta: Meta
): boolean => {
  return phoneNumberMustHaveLengthWithoutSpacesInRange(
    value,
    meta,
    "sharedFields.phoneNumber.ukPhoneNumber.validationError.length",
    10,
    14
  );
};

export const ukPhoneNumberMustBeValid = (
  value: string,
  { req }: Meta
): boolean => {
  if (!containsUKMobileNumber(value)) {
    throw new Error(
      req.t(
        "sharedFields.phoneNumber.ukPhoneNumber.validationError.international"
      )
    );
  }
  return true;
};
//endregion

//region International phone number validators
export const internationalPhoneNumberMustContainLeadingPlusNumbersOrSpacesOnly =
  (value: string, meta: Meta): boolean => {
    return phoneNumberMustContainLeadingPlusNumbersOrSpacesOnly(
      value,
      meta,
      "sharedFields.phoneNumber.internationalPhoneNumber.validationError.plusNumericOnly"
    );
  };

export const internationalPhoneNumberMustHaveLengthWithoutSpacesInRange = (
  value: string,
  meta: Meta
): boolean => {
  return phoneNumberMustHaveLengthWithoutSpacesInRange(
    value,
    meta,
    "sharedFields.phoneNumber.internationalPhoneNumber.validationError.internationalFormat",
    5,
    26
  );
};

export const internationalPhoneNumberMustBeValid = (
  value: string,
  { req }: Meta
): boolean => {
  if (!containsInternationalMobileNumber(value)) {
    throw new Error(
      req.t(
        "sharedFields.phoneNumber.internationalPhoneNumber.validationError.internationalFormat"
      )
    );
  }
  return true;
};
//endregion
