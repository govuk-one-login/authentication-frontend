import { getAccountManagementUrl, getAnalyticsCookieDomain, getLanguageToggleEnabled, } from "../config";
import { generateNonce } from "../utils/strings";
export async function setLocalVarsMiddleware(req, res, next) {
    res.locals.scriptNonce = await generateNonce();
    res.locals.accountManagementUrl = getAccountManagementUrl();
    res.locals.analyticsCookieDomain = getAnalyticsCookieDomain();
    res.locals.languageToggleEnabled = getLanguageToggleEnabled();
    next();
}
