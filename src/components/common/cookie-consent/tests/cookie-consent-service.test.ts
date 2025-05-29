import { expect } from "chai";
import { describe } from "mocha";

import { cookieConsentService } from "../cookie-consent-service.js";
import { COOKIE_CONSENT } from "../../../../app.constants.js";
describe("cookie consent service", () => {
  describe("getCookieConsent", () => {
    it("should return cookie consent value rejected when no cookie present", () => {
      const result = cookieConsentService().getCookieConsent("");
      expect(result.cookie_consent).to.have.be.equal(COOKIE_CONSENT.NOT_ENGAGED);
    });
    it("should return cookie consent value rejected when analytics cookie is false", () => {
      const result = cookieConsentService().getCookieConsent(
        JSON.stringify({ analytics: false })
      );
      expect(result.cookie_consent).to.have.be.equal(COOKIE_CONSENT.REJECT);
    });
    it("should return cookie consent value accept when analytics cookie is true", () => {
      const result = cookieConsentService().getCookieConsent(
        JSON.stringify({ analytics: true })
      );
      expect(result.cookie_consent).to.have.be.equal(COOKIE_CONSENT.ACCEPT);
    });
  });

  describe("createConsentCookieValue", () => {
    it("should return empty value and date in the past when when cookie consent not engaged", () => {
      const result = cookieConsentService().createConsentCookieValue(
        COOKIE_CONSENT.NOT_ENGAGED
      );
      expect(result.value).to.have.be.equal("{}");
      expect(result.expires.getFullYear()).to.have.be.equal(new Date().getFullYear() - 1);
    });

    it("should return analytics true and date a year in the future when cookie consent accepted", () => {
      const result = cookieConsentService().createConsentCookieValue(
        COOKIE_CONSENT.ACCEPT
      );
      expect(result.value).to.have.be.equal('{"analytics":true}');
      expect(result.expires.getFullYear()).to.have.be.equal(new Date().getFullYear() + 1);
    });

    it("should return analytics false and date a year in the future when cookie consent reject", () => {
      const result = cookieConsentService().createConsentCookieValue(
        COOKIE_CONSENT.REJECT
      );
      expect(result.value).to.have.be.equal('{"analytics":false}');
      expect(result.expires.getFullYear()).to.have.be.equal(new Date().getFullYear() + 1);
    });
  });
});
