import * as jose from "jose";
import {
  getOrchToAuthExpectedAudience,
  getOrchToAuthExpectedClientId,
} from "../../../config";

export function createmockclaims(): any {
  const timestamp = Math.floor(new Date().getTime() / 1000);
  return {
    confidence: "Cl.Cm",
    iss: "UNKNOWN",
    consent_required: false,
    client_id: getOrchToAuthExpectedClientId(),
    govuk_signin_journey_id: "QOFzoB3o-9gGplMgdT1dJfH4vaI",
    aud: getOrchToAuthExpectedAudience(),
    service_type: "MANDATORY",
    nbf: timestamp,
    cookie_consent_shared: true,
    scope: "openid email phone",
    state: "WLUNPYv0RPdVjhBsG4QMHYYMhGaOc8X-t83Y1XsVh1w",
    redirect_uri: "UNKNOWN",
    exp: timestamp + 1000,
    iat: timestamp,
    client_name: "di-auth-stub-relying-party-sandpit",
    is_one_login_service: false,
    rp_sector_host: "https://rp.sector.uri",
    jti: "fvvMWAladDtl35O_xyBTRLwwojA",
    claim:
      '{"userinfo": {"email_verified": null, "public_subject_id": null, "email": null}}',
  };
}

export function getPublicKey(): string {
  return "-----BEGIN PUBLIC KEY-----MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEn8HvZP5umARULT+kFlJMC+djrruj4jnfQ0dzrAty0YKF4NPR/WV2QrpCRKQyBwbJk7dcGfW1HpafH78+T8bC9Q==-----END PUBLIC KEY-----";
}

export async function getPrivateKey(): Promise<jose.KeyLike> {
  const key = await jose.importPKCS8(
    "-----BEGIN PRIVATE KEY-----MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg7KK6gFv7hs2DImXpBaaD1ytDX0MJdh/pTK5LDyUzckWhRANCAASfwe9k/m6YBFQtP6QWUkwL52Ouu6PiOd9DR3OsC3LRgoXg09H9ZXZCukJEpDIHBsmTt1wZ9bUelp8fvz5PxsL1-----END PRIVATE KEY-----",
    "ES256"
  );
  return key;
}

export async function getWrongPrivateKey(): Promise<jose.KeyLike> {
  const key = await jose.importPKCS8(
    "-----BEGIN PRIVATE KEY-----MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg+SgpFc3oo6bRHAOhpI6pv85fPm4ehgOPCQM0cEcwIK+hRANCAAS8u0WXxvx2N6bSFtfTggvnkGJvCsYo3jBYvCKJY5m87BcmwcgyFTDbedBbDnOC0OO0xdjLKu8577NnXPvE/jyd-----END PRIVATE KEY-----",
    "ES256"
  );
  return key;
}

export async function createJwt(
  jwtObject: any,
  privateKey: jose.KeyLike
): Promise<string> {
  const jwt = await new jose.SignJWT(jwtObject)
    .setProtectedHeader({ alg: "ES256" })
    .sign(privateKey);
  return jwt;
}
