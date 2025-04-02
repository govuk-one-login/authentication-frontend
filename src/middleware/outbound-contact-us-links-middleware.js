import { getSupportLinkUrl } from "../config";
export function buildUrlFromRequest(req) {
    return `${req.protocol}://${req.get("host")}${req.originalUrl}`;
}
export function appendFromUrlWhenTriagePageUrl(contactUsLinkUrl, fromUrl) {
    const triagePageUrlRegEx = /contact-gov-uk-one-login/;
    if (triagePageUrlRegEx.test(contactUsLinkUrl)) {
        const encodedFromUrl = encodeURIComponent(fromUrl);
        contactUsLinkUrl = `${contactUsLinkUrl}?fromURL=${encodedFromUrl}`;
    }
    return contactUsLinkUrl;
}
export function outboundContactUsLinksMiddleware(req, res, next) {
    let contactUsLinkUrl = getSupportLinkUrl();
    const fromUrl = buildUrlFromRequest(req);
    contactUsLinkUrl = appendFromUrlWhenTriagePageUrl(contactUsLinkUrl, fromUrl);
    res.locals.contactUsLinkUrl = contactUsLinkUrl;
    next();
}
