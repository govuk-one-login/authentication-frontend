import type { NextFunction, Request, Response } from "express";

export function initialiseUserHistoryMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.locals.history = !req.session.user?.journey?.history ? [] : req.session.user.journey.history

  next();
}
