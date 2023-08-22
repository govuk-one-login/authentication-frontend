import {
  defaultSmartAgentClient,
  SmartAgentService,
} from "../../utils/smartAgent";
import {
  ContactForm,
  Descriptions,
  OptionalData,
  Questions,
  SmartAgentCustomAttributes,
} from "./types";

export function prepareSecurityCodeSendMethodTitle(
  securityCodeSentMethod: string
): string {
  let securityCodeMethod = "";
  switch (securityCodeSentMethod) {
    case "email":
      securityCodeMethod = "Email";
      break;
    case "text_message":
      securityCodeMethod = "Text message";
      break;
    case "text_message_uk_number":
      securityCodeMethod = "Text message to a UK phone number";
      break;
    case "text_message_international_number":
      securityCodeMethod =
        "Text message to a phone number from another country";
      break;
    case "authenticator_app":
      securityCodeMethod = "Authenticator app";
      break;
  }

  return securityCodeMethod;
}
export function prepareIdentityDocumentTitle(
  identityDocumentUsed: string
): string {
  let documentUsedDescription = "";
  switch (identityDocumentUsed) {
    case "passport":
      documentUsedDescription = "Passport";
      break;
    case "biometricResidencePermit":
      documentUsedDescription = "Biometric residence permit";
      break;
    case "drivingLicence":
      documentUsedDescription = "Driving licence";
  }

  return documentUsedDescription;
}

export function contactUsServiceSmartAgent(
  smartAgentClient: SmartAgentService = defaultSmartAgentClient
): {
  contactUsSubmitFormSmartAgent: (contactForm: ContactForm) => Promise<void>;
} {
  function formatSmartAgentMessageField(
    descriptions: Descriptions,
    optionalData: OptionalData,
    questions: Questions
  ) {
    const message = [];

    if (descriptions.issueDescription) {
      message.push(`<h3>${questions.issueDescription}</h3>`);
      message.push(`<p>${descriptions.issueDescription}</p>`);
    }

    if (descriptions.additionalDescription) {
      message.push(`<h3>${questions.additionalDescription}</h3>`);
      message.push(`<p>${descriptions.additionalDescription}</p>`);
    }

    if (descriptions.optionalDescription) {
      message.push(`<h3>${questions.optionalDescription}</h3>`);
      message.push(`<p>${descriptions.optionalDescription}</p>`);
    }

    if (descriptions.moreDetailDescription) {
      message.push(`<h3>${questions.moreDetailDescription}</h3>`);
      message.push(`<p>${descriptions.moreDetailDescription}</p>`);
    }

    return message.join("");
  }

  function createSmartAgentCustomAttributes(contactForm: ContactForm) {
    const customAttributes: SmartAgentCustomAttributes = {};

    customAttributes["sa-ticket-id"] =
      contactForm.optionalData.ticketIdentifier;

    if (contactForm.feedbackContact && contactForm.name) {
      customAttributes["sa-tag-customer-name"] = contactForm.name;
    }

    if (contactForm.feedbackContact && contactForm.email) {
      customAttributes["sa-tag-customer-email"] = contactForm.email;
    }

    customAttributes["sa-tag-primary-intent-user-selection"] =
      contactForm.themeQuestions.themeQuestion;

    customAttributes["sa-useragent"] = contactForm.optionalData.userAgent;

    customAttributes["sa-identity-document"] = prepareIdentityDocumentTitle(
      contactForm.identityDocumentUsed
    );

    customAttributes["sa-webformrefer"] = contactForm.referer
      ? contactForm.referer
      : "Unable to capture referer";

    customAttributes["sa-tag-preferred-language"] =
      contactForm.preferredLanguage;

    customAttributes["sa-security-code-sent-method"] =
      prepareSecurityCodeSendMethodTitle(contactForm.securityCodeSentMethod);

    customAttributes["sa-tag-secondary-reason-user-selection"] =
      contactForm.themeQuestions.subthemeQuestion;

    customAttributes["sa-themequestion"] =
      contactForm.themeQuestions.themeQuestion;

    customAttributes["sa-subthemequestion"] =
      contactForm.themeQuestions.subthemeQuestion;

    if (contactForm.descriptions.additionalDescription) {
      customAttributes["sa-additional-description"] =
        contactForm.questions.additionalDescription;
    }

    if (contactForm.descriptions.moreDetailDescription) {
      customAttributes["sa-more-detailed-description"] =
        contactForm.descriptions.moreDetailDescription;
    }

    if (contactForm.descriptions.optionalDescription) {
      customAttributes["sa-optional-description"] =
        contactForm.descriptions.optionalDescription;
    }

    if (contactForm.descriptions.issueDescription) {
      customAttributes["sa-issue-description"] =
        contactForm.descriptions.issueDescription;
    }

    customAttributes["sa-tag-what-gov-service"] =
      contactForm.descriptions.serviceTryingToUse;

    customAttributes["sa-tag-permission-to-email"] = `Permission to email ${
      contactForm.feedbackContact ? "granted" : "denied"
    }`;

    return customAttributes;
  }

  const contactUsSubmitFormSmartAgent = async function (
    contactForm: ContactForm
  ): Promise<void> {
    const payload = {
      email: contactForm.email,
      message: formatSmartAgentMessageField(
        contactForm.descriptions,
        contactForm.optionalData,
        contactForm.questions
      ),
      customAttributes: createSmartAgentCustomAttributes(contactForm),
    };

    await smartAgentClient.createTicket(payload);
  };

  return { contactUsSubmitFormSmartAgent };
}
