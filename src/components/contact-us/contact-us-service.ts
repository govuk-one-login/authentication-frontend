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
          body: formatCommentBody(
            contactForm.comment,
            contactForm.optionalData
          ),
        },
        group_id: getZendeskGroupIdPublic(),
        tags: ["govuk_sign_in"],
      },
    };

    if (contactForm.feedbackContact && contactForm.email && contactForm.name) {
      payload.ticket.requester = {
        email: contactForm.email,
        name: contactForm.name,
      };
    }

    await zendeskClient.createTicket(payload);
  };

  function formatCommentBody(comment: string, optionalData: OptionalData) {
    return `
    ${comment}
    --------------------------------------------------
    Session id:${optionalData.sessionId}
    User agent:${optionalData.userAgent}`;
  }

  return {
    contactUsSubmitForm,
  };
}
