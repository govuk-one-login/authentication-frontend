import { JwtServiceInterface } from "./types";
import { getOrchToAuthSigningPublicKey } from "../../config";
import { JwtClaimsValueError, JwtValidationError } from "../../utils/error";
import { Claims, requiredClaimsKeys, getKnownClaims } from "./claims-config";
import * as jose from "jose";

export class JwtService implements JwtServiceInterface {
  private readonly publicKey;

  constructor(publicKey = getOrchToAuthSigningPublicKey()) {
    this.publicKey = publicKey;
  }

  async getPayloadWithValidation(jwt: string): Promise<Claims> {
    let claims: jose.JWTPayload;
    try {
      const tempkey = await jose.importSPKI(this.publicKey, "ES256");
      claims = (
        await jose.jwtVerify(jwt, tempkey, {
          requiredClaims: requiredClaimsKeys,
          clockTolerance: 30,
        })
      ).payload;
    } catch (error) {
      throw new JwtValidationError(error.message);
    }

    if (claims["claim"] !== undefined) {
      this.validateClaimObject(claims["claim"] as string);
    }

    return this.validateCustomClaims(claims);
  }

  validateCustomClaims(claims: any): Claims {
    const requiredclaims = getKnownClaims();

    Object.keys(requiredclaims).forEach((claim) => {
      if (requiredclaims[claim] !== claims[claim]) {
        throw new JwtClaimsValueError(`${claim} has incorrect value`);
      }
    });
    return claims;
  }

  validateClaimObject(claim: string): string {
    try {
      JSON.parse(claim);
      return claim;
    } catch {
      throw new JwtValidationError("claim object is not a valid json object");
    }
  }
}
