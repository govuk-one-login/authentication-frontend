import type { JwtServiceInterface } from "./types.js";
import {
  getOrchStubToAuthSigningPublicKey,
  getOrchToAuthSigningPublicKey,
} from "../../config.js";
import { JwtClaimsValueError, JwtValidationError } from "../../utils/error.js";
import type { Claims } from "./claims-config.js";
import {
  requiredClaimsKeys,
  getKnownClaims,
  getKnownStubClaims,
} from "./claims-config.js";
import * as jose from "jose";

export class JwtService implements JwtServiceInterface {
  private readonly publicKey;
  private readonly stubPublicKey;

  constructor(
    publicKey = getOrchToAuthSigningPublicKey(),
    stubPublicKey = getOrchStubToAuthSigningPublicKey()
  ) {
    this.publicKey = publicKey;
    this.stubPublicKey = stubPublicKey;
  }

  async getPayloadWithValidation(jwt: string): Promise<Claims> {
    let claims: jose.JWTPayload;

    try {
      claims = await this.validate(jwt);
    } catch (error) {
      throw new JwtValidationError(
        error instanceof Error ? error.message : "Unknown error validating JWT"
      );
    }

    if (claims["claim"] !== undefined) {
      this.validateClaimObject(claims["claim"] as string);
    }

    return this.validateCustomClaims(claims);
  }

  async validate(jwt: string): Promise<jose.JWTPayload> {
    try {
      return await this.validateUsingKey(jwt, this.publicKey);
    } catch (error) {
      if (this.stubPublicKey === "" || this.stubPublicKey === "UNKNOWN") {
        throw error;
      }
      return await this.validateUsingKey(jwt, this.stubPublicKey);
    }
  }

  async validateUsingKey(jwt: string, key: string): Promise<jose.JWTPayload> {
    const keyObject = await jose.importSPKI(key, "ES256");

    const result = await jose.jwtVerify(jwt, keyObject, {
      requiredClaims: requiredClaimsKeys,
      clockTolerance: 30,
    });

    return result.payload;
  }

  validateCustomClaims(claims: any): Claims {
    const requiredClaims = getKnownClaims();
    const stubClaims = getKnownStubClaims();

    Object.keys(requiredClaims).forEach((claim) => {
      if (
        requiredClaims[claim] !== claims[claim] &&
        stubClaims[claim] !== claims[claim]
      ) {
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
