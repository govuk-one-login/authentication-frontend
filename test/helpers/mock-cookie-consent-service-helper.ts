import { sinon } from "../utils/test-utils.js";
import type { CookieConsentServiceInterface } from "../../src/components/common/cookie-consent/types.js";
export function createMockCookieConsentService(
  userCookieConsentPreference: string
): CookieConsentServiceInterface {
  const expiryDate: Date = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);

  return {
    getCookieConsent: sinon.fake(),
    createConsentCookieValue: sinon.fake.returns({
      value: JSON.stringify({
        analytics: userCookieConsentPreference === "true",
      }),
      expires: expiryDate,
    }),
  };
}
