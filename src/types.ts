import { ValidationChain } from "express-validator";

export interface UserSession {
  email?: string;
  phoneNumber?: string;
}

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
  code?: string;
  message?: string;
  sessionState: string;
}

export interface ApiResponseResult {
  success: boolean;
  code?: string;
  message?: string;
  sessionState?: string;
}
