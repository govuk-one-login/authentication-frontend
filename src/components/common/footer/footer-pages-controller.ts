import type { Request, Response } from "express";
import { PATH_NAMES } from "../../../app.constants.js";
import { supportTypeIsGovService } from "../../../utils/request.js";
import { getPrivacyNoticeRedirectEnabled } from "../../../config.js";

export function privacyStatementGet(req: Request, res: Response): void {
  if (getPrivacyNoticeRedirectEnabled()) {
    redirectToExternalPrivacyNotice(req, res);
  } else {
    res.render("common/footer/privacy-statement.njk");
  }
}

export function termsConditionsGet(req: Request, res: Response): void {
  res.render("common/footer/terms-conditions.njk");
}

export function accessibilityStatementGet(req: Request, res: Response): void {
  res.render("common/footer/accessibility-statement.njk");
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
  if (req.i18n.language === "cy") {
    return res.redirect(
      "https://www.gov.uk/government/publications/govuk-one-login-privacy-notice.cy"
    );
  }
  res.redirect(
    "https://www.gov.uk/government/publications/govuk-one-login-privacy-notice"
  );
}

function appendQueryParam(param: string, value: string, url: string) {
  if (!param || !value) {
    return url;
  }

  return `${url}?${param}=${value.trim()}`;
}
