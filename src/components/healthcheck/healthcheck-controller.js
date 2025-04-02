import { HTTP_STATUS_CODES } from "../../app.constants";
export function healthcheckGet(req, res) {
    res.status(HTTP_STATUS_CODES.OK).send("OK");
}
