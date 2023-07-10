import { AuthorizeRequestPayload, JwtServiceInterface } from "./types";
import crypto from "crypto";
import format from "ecdsa-sig-formatter";
import { getOrchToAuthSigningPublicKey } from "../../config";
import {
  JwtPayloadParseError,
  JwtSignatureVerificationError,
} from "../../utils/error";

export class JwtService implements JwtServiceInterface {
  private readonly publicKey;

  constructor(publicKey = getOrchToAuthSigningPublicKey()) {
    this.publicKey = publicKey;
  }

  async verify(urlEncodedJwt: string): Promise<boolean> {
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

  getPayload(jwt: string): AuthorizeRequestPayload {
    const jwtElements = jwt.split(".");
    if (jwtElements.length !== 3) {
      throw new JwtPayloadParseError("JWT was not three elements");
    }
    const payload = jwtElements[1];
    const buffer = Buffer.from(payload, "base64url");
    return JSON.parse(buffer.toString());
  }
}
