import { HTTP_STATUS_CODES } from "../app.constants";
export function pageNotFoundHandler(req, res, next) {
    if (res.headersSent) {
        return next();
    }
    res.status(HTTP_STATUS_CODES.NOT_FOUND);
    res.render("common/errors/404.njk");
}
