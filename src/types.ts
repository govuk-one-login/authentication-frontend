import { ValidationChain } from "express-validator";

import express, { NextFunction, Request, Response } from "express";

export type ExpressRouteFunc = (
  req: Request,
  res: Response,
  next?: NextFunction
) => void | Promise<void>;

export interface RequestGet {
  (name: "set-cookie"): string[];
  (name: string): string;
}

export interface ResponseRedirect {
  (url: string): void;
  (status: number, url: string): void;
  (url: string, status: number): void;
}

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

export interface PlaceholderReplacement {
  search: string;
  replacement: string;
}

export interface UserSession {
  [key: string]: unknown;
  isAuthenticated?: boolean;
  email?: string;
  redactedPhoneNumber?: string;
  phoneNumber?: string;
  journey?: { nextPath: string; optionalPaths: string[] };
  isConsentRequired?: boolean;
  isLatestTermsAndConditionsAccepted?: boolean;
  isIdentityRequired?: boolean;
  isUpliftRequired?: boolean;
  isAccountCreationJourney?: boolean;
  isAccountPartCreated?: boolean;
  docCheckingAppUser?: boolean;
  identityProcessCheckStart?: number;
  authAppSecret?: string;
  authAppQrCodeUrl?: string;
  isPasswordChangeRequired?: boolean;
  featureFlags?: any;
  wrongCodeEnteredLock?: string;
  codeRequestLock?: string;
  wrongCodeEnteredAccountRecoveryLock?: string;
  wrongCodeEnteredPasswordResetLock?: string;
  isAccountRecoveryPermitted?: boolean;
  isAccountRecoveryJourney?: boolean;
  isAccountRecoveryCodeResent?: boolean;
  accountRecoveryVerifiedMfaType?: string;
  reauthenticate?: string;
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
  isOneLoginService?: boolean;
  claim?: string[];
  rpSectorHost?: string;
}
