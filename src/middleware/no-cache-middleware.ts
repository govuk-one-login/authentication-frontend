import { NextFunction, Request, Response } from "express";

export function noCacheMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.set(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  next();
}
