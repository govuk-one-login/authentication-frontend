import { showTestBanner } from "../config";
export function environmentBannerMiddleware(req, res, next) {
    res.locals.showTestBanner = showTestBanner();
    next();
}
