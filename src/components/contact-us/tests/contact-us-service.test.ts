import { expect } from "chai";
import { describe } from "mocha";
import {
  getRefererTag,
  prepareUserLocationTitle,
} from "../contact-us-service-smart-agent";
import { ContactForm } from "../types";

describe("contact-us-service", () => {
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

    it("should return the referer when the fromURL is encoded as a URI component", () => {
      form.referer = "https://localhost:3000/enter-mfa";
      form.fromURL = encodeURIComponent("https://localhost:3000/enter-email");

      expect(getRefererTag(form)).to.equal(
        "Referer obtained via Triage page fromURL: https://localhost:3000/enter-email"
      );
    });
  });

  describe("prepareUserLocationTitle", () => {
    it("should return the UK tag variant when passed 'true'", () => {
      expect(prepareUserLocationTitle("true")).to.equal("resident_in_uk");
    });

    it("should return the non-UK tag variant when passed 'false'", () => {
      expect(prepareUserLocationTitle("false")).to.equal("not_resident_in_uk");
    });

    it("should return an empty string when passed something else", () => {
      ["sooth", "falsehood", ""].forEach((i) => {
        expect(prepareUserLocationTitle(i)).to.equal("");
      });
    });
  });
});
