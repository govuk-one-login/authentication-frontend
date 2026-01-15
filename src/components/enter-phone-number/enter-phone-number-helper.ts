import { supportNewInternationalSms } from "../../config.js";

export function getPhoneNumberTemplateName(): string {
  return supportNewInternationalSms()
    ? "enter-phone-number/index.njk"
    : "enter-phone-number/index-uk-number-only.njk";
}
