import type { NextFunction, Request, Response } from "express";

export function csrfMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // TODO: ATO-4272: Add comment here as to why we are not refreshing per request - reference, and link to, PR description.
  res.locals.csrfToken = req.csrfToken?.(false);
  next();
}
