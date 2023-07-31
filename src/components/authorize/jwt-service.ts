import { JwtServiceInterface } from "./types";
import crypto from "crypto";
import format from "ecdsa-sig-formatter";
import { getOrchToAuthSigningPublicKey } from "../../config";
import {
  ClaimsError,
  JwtPayloadParseError,
  JwtSignatureVerificationError,
} from "../../utils/error";
import { Claims, getClaimsObject, getKnownClaims } from "./claims-config";

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

  async getPayloadWithSigCheck(jwt: string): Promise<any> {
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

  validateClaims(claims: any): Claims {
    this.checkClaimsShapeAndType(claims);

    this.checkClaimsProperties(claims);

    return claims;
  }

  checkClaimsShapeAndType(claims: any): void {
    const errors: string[] = [];

    Object.entries(getClaimsObject()).forEach(([claim, claimValue]) => {
      if (!Object.prototype.hasOwnProperty.call(claims, claim)) {
        errors.push(`${claim} claim missing`);
      } else if (typeof claims[claim] !== typeof claimValue) {
        errors.push(`${claim} claim type is incorrect`);
      }
    });

    if (errors.length > 0) {
      throw new ClaimsError(errors.join("\r\n"));
    }
  }

  checkClaimsProperties(claims: any): void {
    const errors: string[] = [];
    const requiredclaims = getKnownClaims();

    Object.keys(requiredclaims).forEach((claim) => {
      if (requiredclaims[claim] !== claims[claim]) {
        errors.push(`${claim} has incorrect value`);
      }
    });

    if (claims.exp <= Math.floor(new Date().getTime() / 1000)) {
      errors.push("Token expired (exp)");
    }

    if (claims.nbf > Math.floor(new Date().getTime() / 1000)) {
      errors.push("Token not yet valid (nbf)");
    }

    if (errors.length > 0) {
      throw new ClaimsError(errors.join("\r\n"));
    }
  }
}
