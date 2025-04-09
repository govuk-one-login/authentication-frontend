import { NextFunction, Request, Response } from "express";
import { getSupportLinkUrl } from "../config.js";
export function buildUrlFromRequest(req: Request): string {
  return `${req.protocol}://${req.get("host")}${req.originalUrl}`;
}

export function appendFromUrlWhenTriagePageUrl(
  contactUsLinkUrl: string,
  fromUrl: string
): string {
  const triagePageUrlRegEx = /contact-gov-uk-one-login/;

  if (triagePageUrlRegEx.test(contactUsLinkUrl)) {
    const encodedFromUrl = encodeURIComponent(fromUrl);

    contactUsLinkUrl = `${contactUsLinkUrl}?fromURL=${encodedFromUrl}`;
  }

  return contactUsLinkUrl;
}

export function outboundContactUsLinksMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  let contactUsLinkUrl = getSupportLinkUrl();
  const fromUrl = buildUrlFromRequest(req);

  contactUsLinkUrl = appendFromUrlWhenTriagePageUrl(contactUsLinkUrl, fromUrl);

  res.locals.contactUsLinkUrl = contactUsLinkUrl;
  next();
}
