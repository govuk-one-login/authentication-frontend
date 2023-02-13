import { NextFunction, Request, Response } from "express";
import { supportInternationalNumbers } from "../config";

export function setInternationalPhoneNumberSupportMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.locals.ipnSupport = supportInternationalNumbers();
  next();
}
