import { NextFunction, RequestHandler, Response, Request } from "express";

export const asyncHandler = (fn: RequestHandler) =>
  function (req: Request, res: Response, next: NextFunction) {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
