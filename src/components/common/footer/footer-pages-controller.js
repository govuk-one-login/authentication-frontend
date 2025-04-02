import { PATH_NAMES } from "../../../app.constants";
import { supportTypeIsGovService } from "../../../utils/request";
export function privacyStatementGet(req, res) {
    res.render("common/footer/privacy-statement.njk");
}
export function termsConditionsGet(req, res) {
    res.render("common/footer/terms-conditions.njk");
}
export function accessibilityStatementGet(req, res) {
    res.render("common/footer/accessibility-statement.njk");
}
export function supportGet(req, res) {
    res.render("common/footer/support.njk");
}
export function supportPost(req, res) {
    if (supportTypeIsGovService(req)) {
        res.redirect(appendQueryParam("supportType", req.body.supportType, PATH_NAMES.CONTACT_US));
    }
    else {
        res.redirect(res.locals.contactUsLinkUrl);
    }
}
function appendQueryParam(param, value, url) {
    if (!param || !value) {
        return url;
    }
    return `${url}?${param}=${value.trim()}`;
}
