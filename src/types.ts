export interface UserSession {
  id: string;
  scope: string;
  email?: string;
}

import { NextFunction, Request, Response } from "express";

export type ExpressRouteFunc = (
  req: Request,
  res: Response,
  next?: NextFunction
) => void | Promise<void>;
