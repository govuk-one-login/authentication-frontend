import { expect } from "chai";
import { describe } from "mocha";
import {
  contactUsServiceSmartAgent,
  ContactUsSmartAgentService,
  getRefererTag,
  prepareUserLocationTitle,
} from "../contact-us-service-smart-agent";
import { ContactForm } from "../types";
import sinon from "sinon";
import { SmartAgentService } from "../../../utils/smartAgent";
import { CONTACT_US_THEMES } from "../../../app.constants";

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

  describe("contactUsServiceSmartAgent", () => {
    let mockSmartAgentService: sinon.SinonStubbedInstance<SmartAgentService>;
    let contactUsSmartAgentService: ContactUsSmartAgentService;

    beforeEach(() => {
      mockSmartAgentService = sinon.createStubInstance(SmartAgentService);
      mockSmartAgentService.createTicket.resolves();
      contactUsSmartAgentService = contactUsServiceSmartAgent(
        mockSmartAgentService
      );
    });

    describe("contactUsSubmitFormSmartAgent", () => {
      it("produces correct payload for suspect_unauthorised_access submission", async () => {
        const contactForm: ContactForm = {
          // suspect_unauthorised_access fields
          themes: {
            theme: CONTACT_US_THEMES.SUSPECT_UNAUTHORISED_ACCESS,
          },
          suspectUnauthorisedAccess: {
            hasReceivedUnwarrantedSecurityCode: true,
            hasUnknownActivityHistory: true,
          },
          email: "test@example.com",
          telephoneNumber: "1234567890",

          // other required fields
          descriptions: {},
          feedbackContact: false,
          optionalData: {
            userAgent: "testUserAgent",
          },
          questions: {},
          referer: "testReferer",
          subject: "testSubject",
          themeQuestions: {
            themeQuestion: "testThemeQuestion",
          },
        };

        // act
        await contactUsSmartAgentService.contactUsSubmitFormSmartAgent(
          contactForm
        );

        // assert
        const actualPayload =
          mockSmartAgentService.createTicket.getCall(0).args[0];

        expect(actualPayload.customAttributes["sa-tag-theme"]).equal(
          "auth_suspect_unauthorised_access"
        );
        expect(
          actualPayload.customAttributes[
            "sa-tag-has-received-unwarranted-security-code"
          ]
        ).equal("yes");
        expect(
          actualPayload.customAttributes["sa-tag-has-unknown-activity-history"]
        ).equal("yes");
        expect(actualPayload.customAttributes["sa-tag-customer-email"]).equal(
          "test@example.com"
        );
        expect(actualPayload.customAttributes["sa-tag-telephone-number"]).equal(
          "1234567890"
        );
        expect(actualPayload.email).equal("test@example.com");
      });
    });
  });
});
