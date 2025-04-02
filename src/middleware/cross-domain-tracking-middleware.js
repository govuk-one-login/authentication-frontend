import xss from "xss";
export function crossDomainTrackingMiddleware(req, res, next) {
    if (req.query._ga && req.session.client) {
        req.session.client.crossDomainGaTrackingId = xss(req.query._ga);
    }
    next();
}
