import { containsInternationalMobileNumber, containsLeadingPlusNumbersOrSpacesOnly, containsUKMobileNumber, lengthInRangeWithoutSpaces, } from "../../../utils/phone-number";
//region Non-country specific validators
const phoneNumberMustContainLeadingPlusNumbersOrSpacesOnly = (value, { req }, errorMessage) => {
    if (!containsLeadingPlusNumbersOrSpacesOnly(value)) {
        throw new Error(req.t(errorMessage));
    }
    return true;
};
const phoneNumberMustHaveLengthWithoutSpacesInRange = (value, { req }, errorMessage, min, max) => {
    if (!lengthInRangeWithoutSpaces(value, min, max)) {
        throw new Error(req.t(errorMessage));
    }
    return true;
};
//endregion
//region UK phone number validators
export const ukPhoneNumberMustContainLeadingPlusNumbersOrSpacesOnly = (value, meta) => {
    return phoneNumberMustContainLeadingPlusNumbersOrSpacesOnly(value, meta, "sharedFields.phoneNumber.ukPhoneNumber.validationError.plusNumericOnly");
};
export const ukPhoneNumberMustHaveLengthWithoutSpacesInRange = (value, meta) => {
    return phoneNumberMustHaveLengthWithoutSpacesInRange(value, meta, "sharedFields.phoneNumber.ukPhoneNumber.validationError.length", 10, 14);
};
export const ukPhoneNumberMustBeValid = (value, { req }) => {
    if (!containsUKMobileNumber(value)) {
        throw new Error(req.t("sharedFields.phoneNumber.ukPhoneNumber.validationError.international"));
    }
    return true;
};
//endregion
//region International phone number validators
export const internationalPhoneNumberMustContainLeadingPlusNumbersOrSpacesOnly = (value, meta) => {
    return phoneNumberMustContainLeadingPlusNumbersOrSpacesOnly(value, meta, "sharedFields.phoneNumber.internationalPhoneNumber.validationError.plusNumericOnly");
};
export const internationalPhoneNumberMustHaveLengthWithoutSpacesInRange = (value, meta) => {
    return phoneNumberMustHaveLengthWithoutSpacesInRange(value, meta, "sharedFields.phoneNumber.internationalPhoneNumber.validationError.internationalFormat", 5, 26);
};
export const internationalPhoneNumberMustBeValid = (value, { req }) => {
    if (!containsInternationalMobileNumber(value)) {
        throw new Error(req.t("sharedFields.phoneNumber.internationalPhoneNumber.validationError.internationalFormat"));
    }
    return true;
};
//endregion
