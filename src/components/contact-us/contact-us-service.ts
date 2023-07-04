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
import { logger } from "../../utils/logger";

export function getZendeskIdentifierTag(theme: string): string {
  if (theme === ZENDESK_THEMES.ID_CHECK_APP) {
    return "sign_in_app";
  }
  if (theme === ZENDESK_THEMES.PROVING_IDENTITY_FACE_TO_FACE) {
    return "id_face_to_face";
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
      const contactName = contactForm.name
        ? contactForm.name
        : contactForm.email;
      payload.ticket.requester = {
        email: contactForm.email,
        name: contactName,
      };
    }

    try {
      logger.info(
        `Submitting support ticket, see field information:
      subject: ${contactForm?.subject?.length}
      descriptions.issueDescription: ${
        contactForm?.descriptions?.issueDescription?.length
      }
      descriptions.additionalDescription: ${
        contactForm?.descriptions?.additionalDescription?.length
      }
      descriptions.optionalDescription: ${
        contactForm?.descriptions?.optionalDescription?.length
      }
      descriptions.moreDetailDescription: ${
        contactForm?.descriptions?.moreDetailDescription?.length
      }
      descriptions.serviceTryingToUse: ${
        contactForm?.descriptions?.serviceTryingToUse?.length
      }
      optionalData.userAgent: ${contactForm?.optionalData?.userAgent}
      optionalData.ticketIdentifier: ${
        contactForm?.optionalData?.ticketIdentifier
      }
      optionalData.appSessionId: ${contactForm?.optionalData?.appSessionId}
      optionalData.appErrorCode: ${contactForm?.optionalData?.appErrorCode}
      referer: ${contactForm?.referer}
      securityCodeSentMethod: ${contactForm?.securityCodeSentMethod}
      payload.ticket.requester.email: ${
        payload?.ticket?.requester?.email?.length
      }
      payload.ticket.requester.name: ${payload?.ticket?.requester?.name?.length}
      payload.ticket.tags: ${JSON.stringify(payload?.ticket?.tags)}`
      );
    } catch (e) {
      logger.error("Unable to log support ticket details due to error.", e);
    }

    await zendeskClient.createTicket(
      payload,
      contactForm?.optionalData?.ticketIdentifier
    );
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
    if (themes.theme !== ZENDESK_THEMES.PROVING_IDENTITY_FACE_TO_FACE) {
      tagArray.push(tagPrefix + themes.theme);
    }
    if (themes.subtheme) {
      tagArray.push(tagPrefix + themes.subtheme);
    }
    return tagArray;
  }

  return {
    contactUsSubmitForm,
  };
}
