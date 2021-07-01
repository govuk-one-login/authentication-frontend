import { NextFunction, RequestHandler, Response, Request } from "express";

export function asyncHandler(
  fn: RequestHandler
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return function (req: Request, res: Response, next: NextFunction) {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
}
