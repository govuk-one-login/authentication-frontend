import { sinon } from "../utils/test-utils.js";
import type { CookieConsentServiceInterface } from "../../src/components/common/cookie-consent/types.js";
import { cookieConsentService } from "../../src/components/common/cookie-consent/cookie-consent-service.js";
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

export function createCookieConsentMock(): CookieConsentServiceInterface {
  const expiryDate: Date = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);

  const stub = sinon.stub(cookieConsentService(), "createConsentCookieValue");
  stub.withArgs("accept").returns({
    value: JSON.stringify({
      analytics: "true",
    }),
    expires: expiryDate,
  });

  stub.withArgs("reject").returns({
    value: JSON.stringify({
      analytics: "false",
    }),
    expires: expiryDate,
  });

  return {
    getCookieConsent: sinon.fake(),
    createConsentCookieValue: stub,
  };
}
