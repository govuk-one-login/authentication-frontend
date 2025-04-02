import { getAnalyticsCookieDomain, getGA4ContainerId, googleAnalytics4Enabled, } from "../config";
export function setGTM(req, res, next) {
    res.locals.ga4ContainerId = getGA4ContainerId();
    res.locals.analyticsCookieDomain = getAnalyticsCookieDomain();
    res.locals.isGa4Enabled = googleAnalytics4Enabled();
    next();
}
