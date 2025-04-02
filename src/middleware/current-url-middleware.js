export function setCurrentUrlMiddleware(req, res, next) {
    if (req.i18n) {
        res.locals.currentUrl = new URL(req.protocol + "://" + req.get("host") + req.originalUrl);
    }
    next();
}
