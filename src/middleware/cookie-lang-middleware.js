export function getCookieLanguageMiddleware(req, res, next) {
    res.locals.language = req.cookies?.lng;
    next();
}
