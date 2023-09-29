import { expect } from "chai";
import { describe } from "mocha";
import { ZENDESK_THEMES } from "../../../app.constants";
import { getZendeskIdentifierTag } from "../contact-us-service";
import { getRefererTag } from "../contact-us-service-smart-agent";
import { ContactForm } from "../types";

describe("contact-us-service", () => {
  describe("getZendeskIdentifierTag", () => {
    it("should return 'sign_in_app' when passed the ID_CHECK_APP theme", () => {
      expect(getZendeskIdentifierTag(ZENDESK_THEMES.ID_CHECK_APP)).to.equal(
        "sign_in_app"
      );
    });
    for (const theme in ZENDESK_THEMES) {
      it(`should return 'govuk_sign_in' when passed ${theme}`, () => {
        if (theme !== ZENDESK_THEMES.ID_CHECK_APP) {
          expect(getZendeskIdentifierTag(theme)).to.equal("govuk_sign_in");
        }
      });
    }
  });

  describe("getRefererTag", () => {
    const form: ContactForm = {
      descriptions: undefined,
      feedbackContact: false,
      optionalData: undefined,
      questions: undefined,
      referer: "",
      subject: "",
      themeQuestions: undefined,
      themes: undefined,
      fromURL: undefined,
    };

    it("should return the fromURL when one is truthy", () => {
      form.fromURL = "https://localhost:3000/enter-email";

      expect(getRefererTag(form)).to.equal(
        "Referer obtained via Triage page fromURL: https://localhost:3000/enter-email"
      );
    });

    it("should return the fromURL when a referer is also truthy", () => {
      form.referer = "https://localhost:3000/enter-mfa";
      form.fromURL = "https://localhost:3000/enter-email";

      expect(getRefererTag(form)).to.equal(
        "Referer obtained via Triage page fromURL: https://localhost:3000/enter-email"
      );
    });

    it("should return the referer when no fromURL is provided", () => {
      form.referer = "https://localhost:3000/enter-mfa";
      form.fromURL = "";

      expect(getRefererTag(form)).to.equal("https://localhost:3000/enter-mfa");
    });

    it("should return the 'Referer not provided' when a neither fromURL or referer is truthy", () => {
      form.referer = "";
      form.fromURL = "";

      expect(getRefererTag(form)).to.equal("Referer not provided");
    });
  });
});
