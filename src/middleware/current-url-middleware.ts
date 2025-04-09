import type { NextFunction, Request, Response } from "express";

export function setCurrentUrlMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.i18n) {
    res.locals.currentUrl = new URL(
      req.protocol + "://" + req.get("host") + req.originalUrl
    );
  }

  next();
}
