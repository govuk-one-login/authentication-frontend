import { Request, Response } from "express";
import { PATH_NAMES, SUPPORT_TYPE, ZENDESK_THEMES } from "../../app.constants";

export function contactUsGet(req: Request, res: Response): void {
  if (req.query.supportType === SUPPORT_TYPE.GOV_SERVICE) {
    return res.render("contact-us/index-gov-service-contact-us.njk");
  }

  return res.render("contact-us/index-public-contact-us.njk");
}

export function contactUsSubmitSuccessGet(req: Request, res: Response): void {
  res.render("contact-us/index-submit-success.njk");
}

export function furtherInformationGet(req: Request, res: Response): void {
  if (req.query.theme === ZENDESK_THEMES.SIGNING_IN) {
    return res.render("contact-us/index-signing-in-further-information.njk");
  } else if (req.query.theme === ZENDESK_THEMES.ACCOUNT_CREATION) {
    return res.render(
      "contact-us/index-account-creation-further-information.njk"
    );
  }
}

export function contactUsFormPost(req: Request, res: Response): void {
  const queryParams = new URLSearchParams({
    theme: req.body.theme,
  }).toString();

  res.redirect(PATH_NAMES.CONTACT_US_FURTHER_INFORMATION + "?" + queryParams);
}
