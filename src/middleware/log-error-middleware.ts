import { NextFunction, Request, Response } from "express";

export function logErrorMiddleware(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  //pino-http types broke this - waiting for a fix https://github.com/pinojs/pino-http/issues/175
  req.log.error({
    err: { data: error.data, status: error.status, stack: error.stack },
    msg: `Error:${error.message}`,
  });
  next(error);
}
