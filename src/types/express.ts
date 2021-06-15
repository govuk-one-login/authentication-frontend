import { NextFunction, Request, Response } from "express";

export type ExpressRouteFunc = (
  req: Request,
  res: Response,
  next?: NextFunction
) => void | Promise<void>;
