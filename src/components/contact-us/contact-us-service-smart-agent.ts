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
  Themes,
} from "./types";
import { ZENDESK_THEMES } from "../../app.constants";

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

export function getIdentifierTag(theme: string): string {
  if (theme === ZENDESK_THEMES.ID_CHECK_APP) {
    return "sign_in_app";
  }
  if (theme === ZENDESK_THEMES.PROVING_IDENTITY_FACE_TO_FACE) {
    return "id_face_to_face";
  }
  return "govuk_sign_in";
}

export function getThemeTag(themes: Themes): string {
  if (themes.theme !== ZENDESK_THEMES.PROVING_IDENTITY_FACE_TO_FACE) {
    return `auth_${themes.theme}`;
  }
  return "";
}

export function getSubthemeTag(themes: Themes): string {
  if (themes.subtheme) {
    return `auth_${themes.subtheme}`;
  }
  return "";
}

export function getRefererTag(contactForm: ContactForm): string {
  if (contactForm.fromURL) {
    return `Referer obtained via Triage page fromURL: ${contactForm.fromURL}`;
  } else if (contactForm.referer) {
    return contactForm.referer;
  } else {
    return "Referer not provided";
  }
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

    customAttributes["sa-webformrefer"] = getRefererTag(contactForm);

    customAttributes["sa-app-error-code"] =
      contactForm.optionalData.appErrorCode;

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

    customAttributes["sa-tag-identifier"] = getIdentifierTag(
      contactForm.themes.theme
    );

    customAttributes["sa-tag-theme"] = getThemeTag(contactForm.themes);

    customAttributes["sa-tag-subtheme"] = getSubthemeTag(contactForm.themes);

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
