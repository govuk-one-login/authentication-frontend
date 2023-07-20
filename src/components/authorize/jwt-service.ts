import { AuthorizeRequestPayload, JwtServiceInterface } from "./types";
import crypto from "crypto";
import format from "ecdsa-sig-formatter";
import { getOrchToAuthSigningPublicKey } from "../../config";
import {
  ClaimsError,
  JwtPayloadParseError,
  JwtSignatureVerificationError,
} from "../../utils/error";

export class JwtService implements JwtServiceInterface {
  private readonly publicKey;

  constructor(publicKey = getOrchToAuthSigningPublicKey()) {
    this.publicKey = publicKey;
  }

  async signatureCheck(urlEncodedJwt: string): Promise<boolean> {
    try {
      const [header, payload, signature] = urlEncodedJwt.split(".");
      const derSignature = format.joseToDer(signature, "ES256");
      const verify = crypto.createVerify("sha256");
      verify.update(header + "." + payload);
      return verify.verify(this.publicKey, derSignature);
    } catch (error) {
      throw new JwtSignatureVerificationError(
        "Failed to verify signature",
        error
      );
    }
  }

  async getPayloadWithSigCheck(jwt: string): Promise<AuthorizeRequestPayload> {
    const jwtElements = jwt.split(".");
    if (jwtElements.length !== 3) {
      throw new JwtPayloadParseError("JWT was not three elements");
    }

    if ((await this.signatureCheck(jwt)) === false) {
      throw new JwtSignatureVerificationError("Jwt Signature is not valid");
    }
    const payload = jwtElements[1];
    const buffer = Buffer.from(payload, "base64url");

    return JSON.parse(buffer.toString());
  }

  validateClaims(claims: AuthorizeRequestPayload): AuthorizeRequestPayload {
    const expectedkeys = [
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
    expectedkeys.forEach((claim) => {
      if (!Object.prototype.hasOwnProperty.call(claims, claim)) {
        throw new ClaimsError(`${claim} claim missing`);
      }
    });

    if (claims.exp <= Math.floor(new Date().getTime() / 1000)) {
      throw new ClaimsError("Token expired (exp)");
    }

    if (claims.nbf > Math.floor(new Date().getTime() / 1000)) {
      throw new ClaimsError("Token not yet valid (nbf)");
    }

    return claims;
  }
}
