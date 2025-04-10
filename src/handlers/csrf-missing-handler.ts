import type { NextFunction, Request, Response } from "express";

export function csrfMissingHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const CSRF_MISSING_CODE = "EBADCSRFTOKEN";
  if (err.code === CSRF_MISSING_CODE) {
    // CSRF token missing or invalid
    res.status(403).send("Forbidden: Invalid or missing CSRF token");
  } else {
    next(err);
  }
}
