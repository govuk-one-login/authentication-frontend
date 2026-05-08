import type { NextFunction, Request, Response } from "express";

export async function setGoBackHistoryMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  res.locals.goBackHistory = req.session.user?.journey?.goBackHistory ?? [];
  next();
}
