import { ValidationChain } from "express-validator";

import express, { NextFunction, Request, Response } from "express";
import { MFA_METHOD_TYPE } from "./app.constants";

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

export interface UserJourney {
  nextPath: string;
  optionalPaths: string[];
}

export interface UserSession {
  [key: string]: unknown;
  isAuthenticated?: boolean;
  email?: string;
  redactedPhoneNumber?: string;
  phoneNumber?: string;
  journey?: UserJourney;
  isLatestTermsAndConditionsAccepted?: boolean;
  isIdentityRequired?: boolean;
  isUpliftRequired?: boolean;
  isAccountCreationJourney?: boolean;
  isAccountPartCreated?: boolean;
  identityProcessCheckStart?: number;
  authAppSecret?: string;
  authAppQrCodeUrl?: string;
  isPasswordChangeRequired?: boolean;
  featureFlags?: any;
  wrongCodeEnteredLock?: string;
  wrongEmailEnteredLock?: string;
  codeRequestLock?: string;
  wrongCodeEnteredAccountRecoveryLock?: string;
  wrongCodeEnteredPasswordResetLock?: string;
  wrongCodeEnteredPasswordResetMfaLock?: string;
  isAccountRecoveryPermitted?: boolean;
  isAccountRecoveryJourney?: boolean;
  isAccountRecoveryCodeResent?: boolean;
  accountRecoveryVerifiedMfaType?: string;
  reauthenticate?: string;
  enterEmailMfaType?: string;
  withinForcedPasswordResetJourney?: boolean;
  passwordResetTime?: number;
  isPasswordResetJourney?: boolean;
  isSignInJourney?: boolean;
  isVerifyEmailCodeResendRequired?: boolean;
  channel?: string;
  mfaMethodType?: string;
}

export interface UserSessionClient {
  name?: string;
  serviceType?: string;
  cookieConsentEnabled?: boolean;
  crossDomainGaTrackingId?: string;
  scopes?: string[];
  prompt?: string;
  redirectUri?: string;
  state?: string;
  isOneLoginService?: boolean;
  claim?: string[];
  rpSectorHost?: string;
  rpRedirectUri?: string;
  rpState?: string;
}

export type ContentIdFunction = (req: Request) => string;

export enum MfaMethodPriorityIdentifier {
  DEFAULT = "DEFAULT",
  BACKUP = "BACKUP",
}

export type SmsMfaMethod = {
  type: MFA_METHOD_TYPE.SMS;
  priorityIdentifier: MfaMethodPriorityIdentifier;
  phoneNumber?: string;
  redactedPhoneNumber?: string;
};

export type AuthAppMfaMethod = {
  type: MFA_METHOD_TYPE.AUTH_APP;
  priorityIdentifier: MfaMethodPriorityIdentifier;
};

export type MfaMethod = SmsMfaMethod | AuthAppMfaMethod;
