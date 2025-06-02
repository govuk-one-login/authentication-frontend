import {
  getOrchStubToAuthExpectedAudience,
  getOrchStubToAuthExpectedClientId,
  getOrchToAuthExpectedAudience,
  getOrchToAuthExpectedClientId,
} from "../../config.js";
export function getKnownClaims(): {
  [key: string]: string | boolean | number;
} {
  return {
    client_id: getOrchToAuthExpectedClientId(),
    aud: getOrchToAuthExpectedAudience(),
  };
}

export function getKnownStubClaims(): {
  [key: string]: string | boolean | number;
} {
  return {
    client_id: getOrchStubToAuthExpectedClientId(),
    aud: getOrchStubToAuthExpectedAudience(),
  };
}

export type Claims = {
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  nbf: number;
  jti: string;
  client_name: string;
  cookie_consent_shared: boolean;
  is_one_login_service: boolean;
  service_type: string;
  govuk_signin_journey_id: string;
  state: string;
  client_id: string;
  redirect_uri: string;
  rp_client_id: string;
  rp_sector_host: string;
  rp_redirect_uri: string;
  rp_state: string;
  reauthenticate?: string;
  claim?: string;
  previous_session_id?: string;
  previous_govuk_signin_journey_id: string;
  channel?: string;
  authenticated: boolean;
  current_credential_strength?: string;
  cookie_consent?: string;
  _ga?: string;
  scope: string;
  requested_level_of_confidence?: string;
  requested_credential_strength: string;
  is_smoke_test: boolean;
  subject_type: string;
};

export const requiredClaimsKeys = [
  "iss",
  "aud",
  "exp",
  "iat",
  "nbf",
  "jti",
  "client_name",
  "cookie_consent_shared",
  "is_one_login_service",
  "service_type",
  "govuk_signin_journey_id",
  "state",
  "client_id",
  "redirect_uri",
  "rp_sector_host",
  "authenticated",
  "scope",
  "requested_credential_strength",
  "is_smoke_test",
  "subject_type",
];
