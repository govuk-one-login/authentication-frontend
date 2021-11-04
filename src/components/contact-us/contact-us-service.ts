import { ContactForm, ContactUsServiceInterface, OptionalData } from "./types";
import { Client } from "node-zendesk";
import { zendeskAPIClient } from "../../utils/zendesk";
import { getZendeskGroupIdPublic } from "../../config";

export function contactUsService(
  zendeskClient: Client = zendeskAPIClient
): ContactUsServiceInterface {
  const contactUsSubmitForm = async function (
    contactForm: ContactForm
  ): Promise<void> {
    const payload: any = {
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

    if (contactForm.email && contactForm.name) {
      payload.ticket.requester = {
        email: contactForm.email,
        name: contactForm.name,
      };
    }

    await zendeskClient.tickets.create(payload);
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
