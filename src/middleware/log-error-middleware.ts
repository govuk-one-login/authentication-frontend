import { NextFunction, Request, Response } from "express";

export function logErrorMiddleware(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  req.log.error({
    err: { data: error.data, status: error.status, stack: error.stack },
    msg: `Error:${error.message}`,
  });
  next(error);
}
