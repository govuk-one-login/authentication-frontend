import { ApiResponseResult, DefaultApiResponse } from "../../types";

export interface StartAuthResponse extends DefaultApiResponse {
  client: ClientInfo;
  user: UserSessionInfo;
  featureFlags?: Record<string, unknown>;
}

export interface ClientInfo {
  clientName: string;
  scopes: string[];
  serviceType: string;
  cookieConsentShared: boolean;
  redirectUri: string;
  state: string;
  isOneLoginService?: boolean;
}

export interface UserSessionInfo {
  upliftRequired: boolean;
  identityRequired: boolean;
  consentRequired: boolean;
  authenticated: boolean;
  cookieConsent?: string;
  gaCrossDomainTrackingId?: string;
  docCheckingAppUser: boolean;
  mfaMethodType?: string;
}

export interface AuthorizeServiceInterface {
  start: (
    sessionId: string,
    clientSessionId: string,
    sourceIp: string,
    persistentSessionId: string
  ) => Promise<ApiResponseResult<StartAuthResponse>>;
}

export interface KmsDecryptionServiceInterface {
  decrypt(serializedJwe: string): Promise<string>;
}

export interface JwtServiceInterface {
  signatureCheck(jwt: string): Promise<boolean>;
  getPayloadWithSigCheck(jwt: string): Promise<AuthorizeRequestPayload>;
  validateClaims(claims: AuthorizeRequestPayload): AuthorizeRequestPayload;
}

export interface AuthorizeRequestPayload {
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  nbf: number;
  jti: string;
  client_name: string;
  cookie_consent_shared: boolean;
  consent_required: boolean;
  is_one_login_service: boolean;
  service_type: string;
  govuk_signin_journey_id: string;
  confidence: string;
  state: string;
  client_id: string;
  scope: string;
  redirect_uri: string;
}
