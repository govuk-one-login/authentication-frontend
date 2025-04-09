import { NextFunction, Request, Response } from "express";
import {
  ERROR_LOG_LEVEL,
  ERROR_MESSAGES,
  HTTP_STATUS_CODES,
} from "../../app.constants.js";
import { ErrorWithLevel } from "../../utils/error.js";

export function landingGet(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.status(HTTP_STATUS_CODES.FORBIDDEN);
  return next(
    new ErrorWithLevel(ERROR_MESSAGES.FORBIDDEN, ERROR_LOG_LEVEL.INFO)
  );
}
