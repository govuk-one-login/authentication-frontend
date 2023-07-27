import { beforeEach, describe } from "mocha";
import { assert, expect } from "chai";
import { JwtService } from "../jwt-service";
import {
  JwtPayloadParseError,
  JwtSignatureVerificationError,
  ClaimsError,
} from "../../../utils/error";

const validJwt =
  "eyJhbGciOiJFUzI1NiJ9.eyJjbGllbnQtbmFtZSI6ImRpLWF1dGgtc3R1Yi1yZWx5aW5nLXBhcnR5LXNhbmRwaXQifQ.FFNDcj3znW5JPillhEIgCvWFCinlX0PMdvfVxgDArYueiVH6VDvlhaZyS70ocm9eOXBlB8pe449vpJrcKllBBg";
const incorrectJwtSignature =
  "eyJhbGciOiJFUzI1NiJ9.eyJjbGllbnQtbmFtZSI6ImRpLWF1dGgtc3R1Yi1yZWx5aW5nLXBhcnR5LXNhbmRwaXQifQ.FFNDcj3znW5JPillhEIgCvWFCinlX0PMdvfVxgDArYueiVH6VDvlhaZyS80ocm9eOXBlB8pe449vpJrcKllBBg";
const invalidJwtSignature =
  "eyJhbGciOiJFUzI1NiJ9.eyJjbGllbnQtbmFtZSI6ImRpLWF1dGgtc3R1Yi1yZWx5aW5nLXBhcnR5LXNhbmRwaXQifQ.FFNDcj3znW5JPillhEIgCvWFCinlX0PMdvfVxgDArYueiVH6VDvlhaZyS80ocm9eOXBlB8pe";
const testPublicKey =
  "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAESyWJU5s5F4jSovHsh9y133/Ogf5P\nx78OrfDJqiMMI2p8Warbq0ppcbWvbihK6rAXTH7bPIeOHOeU9cKAEl5NdQ==\n-----END PUBLIC KEY-----";

describe("JWT service", () => {
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = new JwtService(testPublicKey);
  });

  describe("verify", () => {
    describe("success", () => {
      it("should return true when signature is valid", async () => {
        const result = await jwtService.signatureCheck(validJwt);

        expect(result).to.be.true;
      });
    });

    describe("failure", () => {
      it("should return false when signature is incorrect", async () => {
        const result = await jwtService.signatureCheck(incorrectJwtSignature);

        expect(result).to.be.false;
      });

      it("should return false when signature is invalid", async () => {
        jwtService = new JwtService(testPublicKey);

        try {
          await jwtService.signatureCheck(invalidJwtSignature);
          assert.fail("Expected error to be thrown");
        } catch (error) {
          expect(error).to.be.an.instanceOf(JwtSignatureVerificationError);
          expect(error.message).to.equal("Failed to verify signature");
          expect(error.cause.message).to.equal(
            '"ES256" signatures must be "64" bytes, saw "54"'
          );
        }
      });

      it("should return false when public key is missing", async () => {
        jwtService = new JwtService(undefined);

        try {
          await jwtService.signatureCheck(validJwt);
          assert.fail("Expected error to be thrown");
        } catch (error) {
          expect(error).to.be.an.instanceOf(JwtSignatureVerificationError);
          expect(error.message).to.equal("Failed to verify signature");
          expect(error.cause.message).to.equal(
            'The "key" argument must be of type string or an instance of ArrayBuffer, Buffer, TypedArray, DataView, KeyObject, or CryptoKey. Received undefined'
          );
        }
      });

      it("should return false when public key is invalid (but not missing)", async () => {
        jwtService = new JwtService("test-key");

        try {
          await jwtService.signatureCheck(validJwt);
          assert.fail("Expected error to be thrown");
        } catch (error) {
          expect(error).to.be.an.instanceOf(JwtSignatureVerificationError);
          expect(error.message).to.equal("Failed to verify signature");
          expect(error.cause.message).to.equal(
            "error:1E08010C:DECODER routines::unsupported"
          );
        }
      });
    });
  });

  describe("getPayloadWithSigCheck", () => {
    describe("success", () => {
      it("should return payload from valid JWT", async () => {
        const result = await jwtService.getPayloadWithSigCheck(validJwt);
        expect(result).to.deep.equal({
          "client-name": "di-auth-stub-relying-party-sandpit",
        });
      });
    });
    describe("failure", () => {
      it("should throw error when passed invalid JWT", async () => {
        try {
          await jwtService.getPayloadWithSigCheck("a");
          assert.fail("Expected error to be thrown");
        } catch (error) {
          expect(error).to.be.an.instanceOf(JwtPayloadParseError);
          expect(error.message).to.equal("JWT was not three elements");
        }
      });
      it("should throw error when passed invalid JWT", async () => {
        try {
          await jwtService.getPayloadWithSigCheck("a.b.c");
          assert.fail("Expected error to be thrown");
        } catch (error) {
          expect(error).to.be.an.instanceOf(JwtSignatureVerificationError);
          expect(error.message).to.equal("Failed to verify signature");
        }
      });
    });
  });

  describe("validateClaims", () => {
    let claims: any;
    beforeEach(() => {
      claims = createmockclaims();
    });

    it("Should return claims if correctly supplied", () => {
      expect(jwtService.validateClaims(claims)).to.be.deep.equal(claims);
    });

    it("Should throw ClaimsError if missing claim", () => {
      Object.keys(claims).forEach((claim) => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { claim, ...payloadWithoutClaim } = claims as any;
          jwtService.validateClaims(payloadWithoutClaim);
        } catch (error) {
          expect(error).to.be.an.instanceOf(ClaimsError);
          expect(error.message).to.equal(`${claim} claim missing`);
        }
      });
    });

    it("Check that multiple errors return in one message", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { aud, iss, ...payloadWithoutClaim } = claims as any;
      try {
        jwtService.validateClaims(payloadWithoutClaim);
      } catch (error) {
        expect(error).to.be.an.instanceOf(ClaimsError);
        expect(error.message).to.contain("iss claim missing");
        expect(error.message).to.contain("aud claim missing");
      }
    });

    it("Should throw ClaimsError if Token expired", () => {
      const now: number = Math.floor(new Date().getTime() / 1000);
      claims.exp = now - 1000;
      try {
        jwtService.validateClaims(claims);
        assert.fail("Expected error to be thrown");
      } catch (error) {
        expect(error).to.be.an.instanceOf(ClaimsError);
        expect(error.message).to.equal("Token expired (exp)");
      }
    });

    it("Should throw ClaimsError if Token before nbf timestamp", () => {
      const now: number = Math.floor(new Date().getTime() / 1000);
      claims.nbf = now + 1000;
      try {
        jwtService.validateClaims(claims);
        assert.fail("Expected error to be thrown");
      } catch (error) {
        expect(error).to.be.an.instanceOf(ClaimsError);
        expect(error.message).to.equal("Token not yet valid (nbf)");
      }
    });
  });

  function createmockclaims(): any {
    const timestamp = Math.floor(new Date().getTime() / 1000);
    return {
      confidence: "Cl.Cm",
      iss: "UNKNOWN",
      consent_required: false,
      client_id: "UNKNOWN",
      govuk_signin_journey_id: "QOFzoB3o-9gGplMgdT1dJfH4vaI",
      aud: "UNKNOWN",
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
      jti: "fvvMWAladDtl35O_xyBTRLwwojA",
    };
  }
});
