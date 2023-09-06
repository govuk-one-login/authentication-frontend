export const EXPECTED_CLIENT_ID = "orchestrationAuth";

export function getKnownClaims(): {
  [key: string]: string | boolean | number;
} {
  return {
    client_id: "orchestrationAuth",
    aud: "UNKNOWN",
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
  consent_required: boolean;
  is_one_login_service: boolean;
  service_type: string;
  govuk_signin_journey_id: string;
  confidence: string;
  state: string;
  client_id: string;
  scope: string;
  redirect_uri: string;
  claim?: string;
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
  "consent_required",
  "is_one_login_service",
  "service_type",
  "govuk_signin_journey_id",
  "confidence",
  "state",
  "client_id",
  "scope",
  "redirect_uri",
];
