import { ValidationChain } from "express-validator";

import express, { NextFunction, Request, Response } from "express";

export type ExpressRouteFunc = (
  req: Request,
  res: Response,
  next?: NextFunction
) => void | Promise<void>;

export type ValidationChainFunc = (
  | ValidationChain
  | ((
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => any)
)[];

export interface ApiResponse {
  code?: number;
  message?: string;
  sessionState: string;
  email?: string;
  data: any;
}

export interface ApiResponseResult {
  success: boolean;
  code?: number;
  message?: string;
  sessionState?: string;
}
