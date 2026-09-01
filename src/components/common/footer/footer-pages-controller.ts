import type { Request, Response } from "express";
import { PATH_NAMES } from "../../../app.constants.js";
import { supportTypeIsGovService } from "../../../utils/request.js";

export function privacyStatementGet(req: Request, res: Response): void {
  redirectToExternalPrivacyNotice(req, res);
}

export function termsConditionsGet(req: Request, res: Response): void {
  res.render("common/footer/terms-conditions.njk");
}

export function accessibilityStatementGet(req: Request, res: Response): void {
  redirectToExternalAccessibilityStatement(req, res);
}

export function supportGet(req: Request, res: Response): void {
  res.render("common/footer/support.njk");
}

export function supportPost(req: Request, res: Response): void {
  if (supportTypeIsGovService(req)) {
    res.redirect(
      appendQueryParam(
        "supportType",
        req.body.supportType,
        PATH_NAMES.CONTACT_US
      )
    );
  } else {
    res.redirect(res.locals.contactUsLinkUrl);
  }
}

function redirectToExternalPrivacyNotice(req: Request, res: Response) {
  const privacyNoticeUrl =
    req.i18n?.language === "cy"
      ? "https://www.gov.uk/government/publications/govuk-one-login-privacy-notice.cy"
      : "https://www.gov.uk/government/publications/govuk-one-login-privacy-notice";
  res.redirect(privacyNoticeUrl);
}

function redirectToExternalAccessibilityStatement(req: Request, res: Response) {
  const accessibilityStatementUrl =
    req.i18n?.language === "cy"
      ? "https://www.gov.uk/guidance/govuk-one-login-accessibility-statement.cy"
      : "https://www.gov.uk/guidance/govuk-one-login-accessibility-statement";
  res.redirect(accessibilityStatementUrl);
}

function appendQueryParam(param: string, value: string, url: string) {
  if (!param || !value) {
    return url;
  }

  return `${url}?${param}=${value.trim()}`;
}
