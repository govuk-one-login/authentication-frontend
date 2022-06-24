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

export interface ApiResponseResult<T> {
  success: boolean;
  data: T;
}

export interface DefaultApiResponse {
  message: string;
  code: number;
}

export interface Error {
  text: string;
  href: string;
}

export interface UserSession {
  isAuthenticated?: boolean;
  email?: string;
  phoneNumber?: string;
  journey?: { nextPath: string; optionalPaths: string[] };
  isConsentRequired?: boolean;
  isLatestTermsAndConditionsAccepted?: boolean;
  isIdentityRequired?: boolean;
  isUpliftRequired?: boolean;
  isAccountPartCreated?: boolean;
  docCheckingAppUser?: boolean;
  identityProcessCheckStart?: number;
  authAppSecret?: string;
}

export interface UserSessionClient {
  name?: string;
  serviceType?: string;
  cookieConsentEnabled?: boolean;
  consentEnabled?: boolean;
  crossDomainGaTrackingId?: string;
  scopes?: string[];
  prompt?: string;
  redirectUri?: string;
  state?: string;
}
