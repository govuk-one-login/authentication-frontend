import { DefaultApiResponse } from "../../types";

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
