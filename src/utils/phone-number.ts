import { isValidPhoneNumber, parsePhoneNumberWithError } from "libphonenumber-js/mobile";

const ALLOWED_TEST_NUMBERS = [
  "07700900000",
  "07700900111",
  "07700900222",
  "+447700900000",
  "+447700900111",
  "+447700900222",
];

export function containsUKMobileNumber(value: string): boolean {
  try {
    return (
      ALLOWED_TEST_NUMBERS.includes(value) ||
      (isValidPhoneNumber(value, "GB") &&
        parsePhoneNumberWithError(value, "GB").countryCallingCode === "44")
    );
  } catch {
    return false;
  }
}

export function containsInternationalMobileNumber(value: string): boolean {
  const formattedNumber = convertInternationalPhoneNumberToE164Format(value);
  return isValidPhoneNumber(formattedNumber);
}

export function containsLeadingPlusNumbersOrSpacesOnly(value: string): boolean {
  return value ? /^\+?[\d\s]+$/.test(value) : false;
}

export function lengthInRangeWithoutSpaces(
  value: string,
  min: number,
  max: number
): boolean {
  const length = value.replace(/\s+/g, "").length;
  return length >= min && length <= max;
}

export function convertInternationalPhoneNumberToE164Format(value: string): string {
  if (value.startsWith("+")) {
    return value;
  }

  if (value.startsWith("00")) {
    return value.replace("00", "+");
  }

  return "+".concat(value);
}

export function returnLastCharactersOnly(
  value: string,
  options: { limit: number } = { limit: 4 }
): string {
  return value?.length ? value.slice(-options.limit) : "";
}
