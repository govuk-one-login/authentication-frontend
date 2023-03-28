import {
  ContactForm,
  ContactUsServiceInterface,
  Descriptions,
  OptionalData,
  Questions,
  ThemeQuestions,
  Themes,
} from "./types";
import { defaultZendeskClient } from "../../utils/zendesk";
import { getZendeskGroupIdPublic } from "../../config";
import { CreateTicketPayload, ZendeskInterface } from "../../utils/types";
import { ZENDESK_THEMES } from "../../app.constants";

export function getZendeskIdentifierTag(theme: string): string {
  if (theme === ZENDESK_THEMES.ID_CHECK_APP) {
    return "sign_in_app";
  }
  return "govuk_sign_in";
}

export function contactUsService(
  zendeskClient: ZendeskInterface = defaultZendeskClient
): ContactUsServiceInterface {
  const contactUsSubmitForm = async function (
    contactForm: ContactForm
  ): Promise<void> {
    const payload: CreateTicketPayload = {
      ticket: {
        subject: contactForm.subject,
        comment: {
          html_body: formatCommentBody(
            contactForm.descriptions,
            contactForm.optionalData,
            contactForm.questions,
            contactForm.themeQuestions,
            contactForm.referer,
            contactForm.securityCodeSentMethod
          ),
        },
        group_id: getZendeskGroupIdPublic(),
        tags: [
          getZendeskIdentifierTag(contactForm.themes.theme),
          ...prefixThemeTags(contactForm.themes),
        ],
      },
    };

    if (contactForm.feedbackContact && contactForm.email) {
      payload.ticket.requester = {
        email: contactForm.email,
        name: contactForm.name,
      };
    }

    await zendeskClient.createTicket(payload);
  };

  function formatCommentBody(
    descriptions: Descriptions,
    optionalData: OptionalData,
    questions: Questions,
    themeQuestions: ThemeQuestions,
    referer: string,
    securityCodeSentMethod: string
  ) {
    const htmlBody = [];

    htmlBody.push(`<span>[What are you contacting us about?]</span>`);
    htmlBody.push(`<p>${themeQuestions.themeQuestion}</p>`);

    if (themeQuestions.subthemeQuestion) {
      htmlBody.push(`<span>[Issue]</span>`);
      htmlBody.push(`<p>${themeQuestions.subthemeQuestion}</p>`);
    }

    if (securityCodeSentMethod) {
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
      htmlBody.push(`<span>[${questions.radioButtons}]</span>`);
      htmlBody.push(`<p>${securityCodeMethod}</p>`);
    }

    if (descriptions.issueDescription) {
      htmlBody.push(`<span>[${questions.issueDescription}]</span>`);
      htmlBody.push(`<p>${descriptions.issueDescription}</p>`);
    }

    if (descriptions.additionalDescription) {
      htmlBody.push(`<span>[${questions.additionalDescription}]</span>`);
      htmlBody.push(`<p>${descriptions.additionalDescription}</p>`);
    }

    if (descriptions.optionalDescription) {
      htmlBody.push(`<span>[${questions.optionalDescription}]</span>`);
      htmlBody.push(`<p>${descriptions.optionalDescription}</p>`);
    }

    if (descriptions.moreDetailDescription) {
      htmlBody.push(`<span>[${questions.moreDetailDescription}]</span>`);
      htmlBody.push(`<p>${descriptions.moreDetailDescription}</p>`);
    }

    if (descriptions.serviceTryingToUse) {
      htmlBody.push(`<span>[${questions.serviceTryingToUse}]</span>`);
      htmlBody.push(`<p>${descriptions.serviceTryingToUse}</p>`);
    }

    htmlBody.push(`<span>[Ticket Identifier]</span>`);
    if (optionalData.ticketIdentifier) {
      htmlBody.push(`<p>${optionalData.ticketIdentifier}</p>`);
    } else {
      htmlBody.push(`<p>Unable to capture ticket identifier</p>`);
    }

    if (optionalData.appErrorCode) {
      htmlBody.push(`<span>[ID Check App error code]</span>`);
      htmlBody.push(`<p>${optionalData.appErrorCode}</p>`);
    }

    htmlBody.push(`<span>[From page]</span>`);
    if (referer) {
      htmlBody.push(`<p>${referer}</p>`);
    } else {
      htmlBody.push(`<p>Unable to capture referer</p>`);
    }

    htmlBody.push(`<span>[User Agent]</span>`);
    htmlBody.push(`<p>${optionalData.userAgent}</p>`);

    return htmlBody.join("");
  }

  function prefixThemeTags(themes: Themes) {
    const tagPrefix = "auth_";
    const tagArray = [];
    tagArray.push(tagPrefix + themes.theme);
    if (themes.subtheme) {
      tagArray.push(tagPrefix + themes.subtheme);
    }
    return tagArray;
  }

  return {
    contactUsSubmitForm,
  };
}
