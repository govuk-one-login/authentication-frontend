import type { NextFunction, Request, Response } from "express";
import xss from "xss";

export function crossDomainTrackingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.query._ga && req.session.client) {
    req.session.client.crossDomainGaTrackingId = xss(req.query._ga as string);
  }

  next();
}
