import { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import { helmetConfiguration } from "../config/helmet";

export function setCspHeaders(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  helmet(helmetConfiguration(req))(req, res, next);
}
