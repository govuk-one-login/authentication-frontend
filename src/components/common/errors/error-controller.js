import { HTTP_STATUS_CODES } from "../../../app.constants";
export function errorPageGet(req, res) {
    res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
    res.render("common/errors/500.njk");
}
