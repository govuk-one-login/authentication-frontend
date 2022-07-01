import { isValidPhoneNumber } from "libphonenumber-js/mobile";

const ALLOWED_TEST_NUMBERS = ["07700900222"];

export function containsUKMobileNumber(value: string): boolean {
  return (
    ALLOWED_TEST_NUMBERS.includes(value) ||
    (isValidPhoneNumber(value, "GB") && /^([+?44]{2}|[07]{2}).*$/.test(value))
  );
}

export function containsInternationalMobileNumber(value: string): boolean {
  return isValidPhoneNumber(prependInternationalPrefix(value));
}

export function containsNumbersOrSpacesOnly(value: string): boolean {
  return value ? /^[\d\s]+$/.test(value) : false;
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

export function prependInternationalPrefix(value: string): string {
  return value.startsWith("+") ? value : "+".concat(value);
}
