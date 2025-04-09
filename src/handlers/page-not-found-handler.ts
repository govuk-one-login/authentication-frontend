import type { NextFunction, Request, Response } from "express";
import { HTTP_STATUS_CODES } from "../app.constants.js";
export function pageNotFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (res.headersSent) {
    return next();
  }

  res.status(HTTP_STATUS_CODES.NOT_FOUND);
  res.render("common/errors/404.njk");
}
