import type { ValidationChain } from "express-validator";

import type { NextFunction, Request, Response } from "express";
import type express from "express";
import { MFA_METHOD_TYPE } from "./app.constants.js";

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
  mfaMethods?: MfaMethod[];
  journey?: UserJourney;
  isLatestTermsAndConditionsAccepted?: boolean;
  isIdentityRequired?: boolean;
  isUpliftRequired?: boolean;
  isAccountCreationJourney?: boolean;
  isAccountPartCreated?: boolean;
  identityProcessCheckStart?: number;
  qrCodeText?: string;
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
  accountRecoveryVerifiedMfaType?: string;
  reauthenticate?: string;
  withinForcedPasswordResetJourney?: boolean;
  passwordResetTime?: number;
  isPasswordResetJourney?: boolean;
  isSignInJourney?: boolean;
  isVerifyEmailCodeResendRequired?: boolean;
  channel?: string;
  mfaMethodType?: MFA_METHOD_TYPE;
  isMfaRequired?: boolean;
  activeMfaMethodId?: string;
  sentOtpMfaMethodIds?: string[];
  hasActivePasskey?: boolean;
}

export interface UserSessionClient {
  journeyId?: string;
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
  rpClientId?: string;
  rpSectorHost?: string;
  rpRedirectUri?: string;
  rpState?: string;
}

export type ContentIdFunction = (req: Request) => string;

export enum MfaMethodPriority {
  DEFAULT = "DEFAULT",
  BACKUP = "BACKUP",
}

export type SmsMfaMethod = {
  id?: string;
  type: MFA_METHOD_TYPE.SMS;
  priority: MfaMethodPriority;
  phoneNumber?: string;
  redactedPhoneNumber?: string;
};

export const isSmsMfaMethod = (
  mfaMethod: MfaMethod
): mfaMethod is SmsMfaMethod => mfaMethod.type === MFA_METHOD_TYPE.SMS;

export type AuthAppMfaMethod = {
  id?: string;
  type: MFA_METHOD_TYPE.AUTH_APP;
  priority: MfaMethodPriority;
};

export type MfaMethod = SmsMfaMethod | AuthAppMfaMethod;
