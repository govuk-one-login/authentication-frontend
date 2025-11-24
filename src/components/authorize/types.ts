import type { MFA_METHOD_TYPE } from "../../app.constants.js";
import type { ApiResponseResult, DefaultApiResponse } from "../../types.js";
import type { Claims } from "./claims-config.js";
import type { Request, Response } from "express";

export interface StartRequestParameters {
  authenticated: boolean;
  previous_session_id?: string;
  rp_pairwise_id_for_reauth?: string;
  previous_govuk_signin_journey_id?: string;
  reauthenticate?: string;
  cookie_consent?: string;
  _ga?: string;
  rp_client_id: string;
  scope: string;
  rp_redirect_uri: string;
  rp_state: string;
  requested_level_of_confidence?: string;
  requested_credential_strength: string;
  client_name: string;
  service_type: string;
  cookie_consent_shared: boolean;
  is_smoke_test: boolean;
  is_one_login_service: boolean;
  subject_type: string;
  is_identity_verification_required: boolean;
  rp_sector_host: string;
  // For backend JAR validation
  clientId: string;
  request: string;
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
  mfaMethodType?: MFA_METHOD_TYPE;
  isBlockedForReauth: boolean;
}

export interface AuthorizeServiceInterface {
  start: (
    req: Request,
    res: Response,
    startRequestParameters: StartRequestParameters
  ) => Promise<ApiResponseResult<StartAuthResponse>>;
}

export interface DecryptionServiceInterface {
  decrypt(serializedJwe: string): Promise<string>;
}

export interface JwtServiceInterface {
  getPayloadWithValidation(jwt: string): Promise<Claims>;
}
