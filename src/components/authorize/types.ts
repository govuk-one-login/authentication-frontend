import { ApiResponseResult, DefaultApiResponse } from "../../types";
import { Claims } from "./claims-config";
import { Request } from "express";

export interface StartRequestParameters {
  authenticated: boolean;
  previous_session_id?: string;
  rp_pairwise_id_for_reauth?: string;
  previous_govuk_signin_journey_id?: string;
  reauthenticate?: string;
}

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
    startRequestParameters: StartRequestParameters
  ) => Promise<ApiResponseResult<StartAuthResponse>>;
}

export interface KmsDecryptionServiceInterface {
  decrypt(serializedJwe: string): Promise<string>;
}

export interface JwtServiceInterface {
  getPayloadWithValidation(jwt: string): Promise<Claims>;
}
