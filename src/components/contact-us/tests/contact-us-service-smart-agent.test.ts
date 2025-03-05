import sinon from "sinon";
import { SmartAgentService } from "../../../utils/smartAgent";
import {
  contactUsServiceSmartAgent,
  ContactUsSmartAgentService,
} from "../contact-us-service-smart-agent";
import { ContactForm } from "../types";
import { CONTACT_US_THEMES } from "../../../app.constants";
import { expect } from "chai";
import { describe } from "mocha";

describe("contact-us-service-smart-agent", () => {
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
