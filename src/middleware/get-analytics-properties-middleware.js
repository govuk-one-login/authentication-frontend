import { getRequestTaxonomy } from "../utils/taxonomy";
import { getContentId } from "../utils/contentId";
export function getAnalyticsPropertiesMiddleware(req, res, next) {
    const _render = res.render;
    res.render = function (view, options, callback) {
        const taxonomy = getRequestTaxonomy(req);
        const contentId = getContentId(req);
        let done = callback;
        let opts;
        if (isCallbackFunction(options)) {
            done = options;
            opts = { contentId, ...taxonomy };
        }
        else {
            opts = options
                ? { contentId, ...options, ...taxonomy }
                : { contentId, ...taxonomy };
        }
        _render.call(this, view, opts, done);
    };
    next();
}
function isCallbackFunction(options) {
    return typeof options === "function";
}
