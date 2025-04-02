import { ERROR_LOG_LEVEL } from "../app.constants";
export function logErrorMiddleware(error, req, res, next) {
    if (error.level && error.level === ERROR_LOG_LEVEL.INFO) {
        req.log.info({
            err: { data: error.data, status: error.status },
            msg: `${error.message}`,
        });
    }
    else {
        req.log.error({
            err: { data: error.data, status: error.status, stack: error.stack },
            msg: `${ERROR_LOG_LEVEL.ERROR}:${error.message}`,
        });
    }
    next(error);
}
