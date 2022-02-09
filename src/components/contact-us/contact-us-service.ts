import { ContactForm, ContactUsServiceInterface, OptionalData } from "./types";
import { defaultZendeskClient } from "../../utils/zendesk";
import { getZendeskGroupIdPublic } from "../../config";
import { CreateTicketPayload, ZendeskInterface } from "../../utils/types";

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
            contactForm.contents,
            contactForm.optionalData
          ),
        },
        group_id: getZendeskGroupIdPublic(),
        tags: ["govuk_sign_in", ...prefixThemeTags(contactForm.tags)],
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

  function formatCommentBody(contents: string[], optionalData: OptionalData) {
    const htmlBody = [];

    for (const item of contents) {
      if (item) {
        htmlBody.push(`<p>${item}</p>`);
      }
    }
    htmlBody.push(`<p>User agent:${optionalData.userAgent}</p>`);
    htmlBody.push(`<p>Session id:${optionalData.sessionId}</p>`);

    return htmlBody.join("");
  }

  function prefixThemeTags(tags: string[]) {
    const tagPrefix = 'auth_';
    return tags.map(i => tagPrefix + i)
  }

  return {
    contactUsSubmitForm,
  };
}
