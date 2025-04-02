export function setHtmlLangMiddleware(req, res, next) {
    if (req.i18n) {
        res.locals.htmlLang = req.i18n.language;
    }
    next();
}
