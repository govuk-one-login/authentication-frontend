import { ApiResponseResult, DefaultApiResponse } from "../../types";
import { Claims } from "./claims-config";
import { Request } from "express";

export interface StartAuthResponse extends DefaultApiResponse {
  user: UserSessionInfo;
  featureFlags?: Record<string, unknown>;
}

export interface UserSessionInfo {
  upliftRequired: boolean;
  identityRequired: boolean;
  authenticated: boolean;
  cookieConsent?: string;
  gaCrossDomainTrackingId?: string;
  docCheckingAppUser: boolean;
  mfaMethodType?: string;
  isBlockedForReauth: boolean;
}

export interface AuthorizeServiceInterface {
  start: (
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request,
    reauthenticate?: string,
    previousSessionId?: string
  ) => Promise<ApiResponseResult<StartAuthResponse>>;
}

export interface KmsDecryptionServiceInterface {
  decrypt(serializedJwe: string): Promise<string>;
}

export interface JwtServiceInterface {
  getPayloadWithValidation(jwt: string): Promise<Claims>;
}
