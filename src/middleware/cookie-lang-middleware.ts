import type { NextFunction, Request, Response } from "express";

export function getCookieLanguageMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.locals.language = req.cookies?.lng;

  next();
}
