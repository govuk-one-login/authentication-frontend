import type { NextFunction, Request, Response } from "express";
import { ERROR_LOG_LEVEL } from "../app.constants.js";
export function logErrorMiddleware(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (error.level && error.level === ERROR_LOG_LEVEL.INFO) {
    req.log.info({
      err: { data: error.data, status: error.status },
      msg: `${error.message}`,
    });
  } else {
    req.log.error({
      err: { data: error.data, status: error.status, stack: error.stack },
      msg: `${ERROR_LOG_LEVEL.ERROR}:${error.message}`,
    });
  }
  next(error);
}
