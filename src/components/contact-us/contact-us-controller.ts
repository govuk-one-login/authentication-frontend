import { Request, Response } from "express";
import { ContactUsServiceInterface } from "./types";
import { contactUsService } from "./contact-us-service";
import { ExpressRouteFunc } from "../../types";
import { PATH_NAMES, SUPPORT_TYPE } from "../../app.constants";

export function contactUsGet(req: Request, res: Response): void {
  if (req.query.supportType === SUPPORT_TYPE.GOV_SERVICE) {
    return res.render("contact-us/index-gov-service-contact-us.njk");
  }

  return res.render("contact-us/index-public-contact-us.njk");
}

export function contactUsSubmitSuccessGet(req: Request, res: Response): void {
  res.render("contact-us/index-submit-success.njk");
}

export function contactUsFormPost(
  service: ContactUsServiceInterface = contactUsService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    await service.contactUsSubmitForm({
      comment: req.body.issueDescription,
      subject: "GOV.UK Accounts Feedback",
      email: req.body.replyEmail,
      name: req.body.name,
      optionalData: {
        sessionId: res.locals.sessionId,
        userAgent: req.get("User-Agent"),
      },
      feedbackContact: req.body.feedbackContact === "true",
    });

    return res.redirect(PATH_NAMES.CONTACT_US_SUBMIT_SUCCESS);
  };
}
