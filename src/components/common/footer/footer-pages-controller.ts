import { Request, Response } from "express";
import { PATH_NAMES } from "../../../app.constants";

export function privacyStatementGet(req: Request, res: Response): void {
  res.render("common/footer/privacy-statement.njk");
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
  res.redirect(
    appendQueryParam("supportType", req.body.supportType, PATH_NAMES.CONTACT_US)
  );
}

function appendQueryParam(param: string, value: string, url: string) {
  if (!param || !value) {
    return url;
  }

  return `${url}?${param}=${value.trim()}`;
}
