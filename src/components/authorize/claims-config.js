import { getOrchStubToAuthExpectedAudience, getOrchStubToAuthExpectedClientId, getOrchToAuthExpectedAudience, getOrchToAuthExpectedClientId, } from "../../config";
export function getKnownClaims() {
    return {
        client_id: getOrchToAuthExpectedClientId(),
        aud: getOrchToAuthExpectedAudience(),
    };
}
export function getKnownStubClaims() {
    return {
        client_id: getOrchStubToAuthExpectedClientId(),
        aud: getOrchStubToAuthExpectedAudience(),
    };
}
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
    "confidence",
    "state",
    "client_id",
    "redirect_uri",
    "rp_sector_host",
    "authenticated",
];
