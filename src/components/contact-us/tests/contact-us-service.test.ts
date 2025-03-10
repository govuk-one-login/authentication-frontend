import { expect } from "chai";
import { describe } from "mocha";
import {
  ContactUsService,
  getContactUsService,
  getIdentifierTag,
  getRefererTag,
  getSubthemeTag,
  getThemeTag,
  prepareIdentityDocumentTitle,
  prepareProblemWithTitle,
  prepareSecurityCodeSendMethodTitle,
  prepareUserLocationTitle,
} from "../contact-us-service";
import { ContactForm } from "../types";
import sinon from "sinon";
import { SmartAgentService } from "../../../utils/smartAgent";
import { CONTACT_US_THEMES } from "../../../app.constants";

describe("contact-us-service", () => {
  describe("prepareSecurityCodeSendMethodTitle", () => {
    [
      {
        securityCodeSentMethod: "email",
        expectedSecurityCodeSentMethodTitle: "Email",
      },
      {
        securityCodeSentMethod: "text_message",
        expectedSecurityCodeSentMethodTitle: "Text message",
      },
      {
        securityCodeSentMethod: "text_message_uk_number",
        expectedSecurityCodeSentMethodTitle:
          "Text message to a UK phone number",
      },
      {
        securityCodeSentMethod: "text_message_international_number",
        expectedSecurityCodeSentMethodTitle:
          "Text message to a phone number from another country",
      },
      {
        securityCodeSentMethod: "authenticator_app",
        expectedSecurityCodeSentMethodTitle: "Authenticator app",
      },
      {
        securityCodeSentMethod: "unknown",
        expectedSecurityCodeSentMethodTitle: "",
      },
    ].forEach(
      ({ securityCodeSentMethod, expectedSecurityCodeSentMethodTitle }) => {
        it(`should return '${expectedSecurityCodeSentMethodTitle}' for security code method '${securityCodeSentMethod}'`, () => {
          const actualSecurityCodeSentMethodTitle =
            prepareSecurityCodeSendMethodTitle(securityCodeSentMethod);

          expect(actualSecurityCodeSentMethodTitle).to.equal(
            expectedSecurityCodeSentMethodTitle
          );
        });
      }
    );
  });

  describe("prepareIdentityDocumentTitle", () => {
    [
      {
        identityDocumentUsed: "passport",
        expectedIdentityDocumentTitle: "Passport",
      },
      {
        identityDocumentUsed: "biometricResidencePermit",
        expectedIdentityDocumentTitle: "Biometric residence permit",
      },
      {
        identityDocumentUsed: "drivingLicence",
        expectedIdentityDocumentTitle: "Driving licence",
      },
      {
        identityDocumentUsed: "unknown",
        expectedIdentityDocumentTitle: "",
      },
    ].forEach(({ identityDocumentUsed, expectedIdentityDocumentTitle }) => {
      it(`should return '${expectedIdentityDocumentTitle}' for identity document '${identityDocumentUsed}'`, () => {
        const actualIdentityDocumentTitle =
          prepareIdentityDocumentTitle(identityDocumentUsed);

        expect(actualIdentityDocumentTitle).to.equal(
          expectedIdentityDocumentTitle
        );
      });
    });
  });

  describe("prepareProblemWithTitle", () => {
    [
      {
        problemWith: "name",
        expectedProblemWithTitle: "Entering your name",
      },
      {
        problemWith: "bankOrBuildingSocietyDetails",
        expectedProblemWithTitle:
          "Entering your bank or building society account details",
      },
      {
        problemWith: "unknown",
        expectedProblemWithTitle: "",
      },
    ].forEach(({ problemWith, expectedProblemWithTitle }) => {
      it(`should return '${expectedProblemWithTitle}' for problem with '${problemWith}'`, () => {
        const actualProblemWithTitle = prepareProblemWithTitle(problemWith);

        expect(actualProblemWithTitle).to.equal(expectedProblemWithTitle);
      });
    });
  });

  describe("getIdentifierTag", () => {
    [
      {
        theme: CONTACT_US_THEMES.ID_CHECK_APP,
        expectedIdentifierTag: "sign_in_app",
      },
      {
        theme: CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE,
        expectedIdentifierTag: "id_face_to_face",
      },
      {
        theme: "unknown",
        expectedIdentifierTag: "govuk_sign_in",
      },
    ].forEach(({ theme, expectedIdentifierTag }) => {
      it(`should return '${expectedIdentifierTag}' for theme ${theme}`, () => {
        const actualIdentifierTag = getIdentifierTag(theme);

        expect(actualIdentifierTag).to.equal(expectedIdentifierTag);
      });
    });
  });

  describe("getThemeTag", () => {
    [
      {
        themes: { theme: CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE },
        expectedThemeTag: "",
      },
      {
        themes: { theme: "any_other_theme" },
        expectedThemeTag: "auth_any_other_theme",
      },
    ].forEach(({ themes, expectedThemeTag }) => {
      it(`should return '${expectedThemeTag}' for themes '${JSON.stringify(themes)}'`, () => {
        const actualThemeTag = getThemeTag(themes);

        expect(actualThemeTag).to.equal(expectedThemeTag);
      });
    });
  });

  describe("getSubthemeTag", () => {
    [
      {
        themes: { theme: "test_theme", subtheme: "test_subtheme" },
        expectedSubthemeTag: "auth_test_subtheme",
      },
      {
        themes: { theme: "test_theme" },
        expectedSubthemeTag: "",
      },
    ].forEach(({ themes, expectedSubthemeTag }) => {
      it(`should return '${expectedSubthemeTag}' for subtheme '${JSON.stringify(themes)}'`, () => {
        const actualSubthemeTag = getSubthemeTag(themes);

        expect(actualSubthemeTag).to.equal(expectedSubthemeTag);
      });
    });
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

  describe("contactUsService", () => {
    let mockSmartAgentService: sinon.SinonStubbedInstance<SmartAgentService>;
    let contactUsService: ContactUsService;

    beforeEach(() => {
      mockSmartAgentService = sinon.createStubInstance(SmartAgentService);
      mockSmartAgentService.createTicket.resolves();
      contactUsService = getContactUsService(mockSmartAgentService);
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
        await contactUsService.contactUsSubmitFormSmartAgent(contactForm);

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
