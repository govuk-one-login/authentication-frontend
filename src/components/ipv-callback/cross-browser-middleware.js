import { sessionIsValid } from "../../middleware/session-middleware";
export const crossBrowserMiddleware = (crossBrowserService) => {
    return async (req, res, next) => {
        if (!sessionIsValid(req) && crossBrowserService.isCrossBrowserIssue(req)) {
            const orchestrationRedirectUrl = await crossBrowserService.getOrchestrationRedirectUrl(req);
            return res.redirect(orchestrationRedirectUrl);
        }
        next();
    };
};
