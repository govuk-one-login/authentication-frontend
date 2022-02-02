import { Request, Response } from "express";
import { PATH_NAMES, SUPPORT_TYPE, ZENDESK_THEMES } from "../../app.constants";

const themes = {
  [ZENDESK_THEMES.SOMETHING_ELSE]:
    "contact-us/questions/index-another-problem-questions.njk",
  [ZENDESK_THEMES.EMAIL_SUBSCRIPTIONS]:
    "contact-us/questions/index-email-subscriptions-questions.njk",
  [ZENDESK_THEMES.SUGGESTIONS_FEEDBACK]:
    "contact-us/questions/index-suggestion-feedback-questions.njk",
  [ZENDESK_THEMES.SIGNING_IN]:
    "contact-us/further-information/index-signing-in-further-information.njk",
  [ZENDESK_THEMES.ACCOUNT_CREATION]:
    "contact-us/further-information/index-account-creation-further-information.njk",
};

export function contactUsGet(req: Request, res: Response): void {
  if (req.query.supportType === SUPPORT_TYPE.GOV_SERVICE) {
    return res.render("contact-us/index-gov-service-contact-us.njk");
  }

  return res.render("contact-us/index-public-contact-us.njk");
}

export function contactUsSubmitSuccessGet(req: Request, res: Response): void {
  res.render("contact-us/index-submit-success.njk");
}

export function contactUsQuestionsGet(req: Request, res: Response): void {
  return res.render(themes[req.query.theme as string]);
}

export function furtherInformationGet(req: Request, res: Response): void {
  return res.render(themes[req.query.theme as string]);
}

export function contactUsFormPost(req: Request, res: Response): void {
  let url = PATH_NAMES.CONTACT_US_QUESTIONS;
  if (
    req.body.theme === ZENDESK_THEMES.ACCOUNT_CREATION ||
    req.body.theme === ZENDESK_THEMES.SIGNING_IN
  ) {
    url = PATH_NAMES.CONTACT_US_FURTHER_INFORMATION;
  }
  const queryParams = new URLSearchParams({
    theme: req.body.theme,
  }).toString();
  res.redirect(url + "?" + queryParams);
}
