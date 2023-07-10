import { beforeEach, describe } from "mocha";
import { assert, expect } from "chai";
import { JwtService } from "../jwt-service";
import {
  JwtPayloadParseError,
  JwtSignatureVerificationError,
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
        const result = await jwtService.verify(validJwt);

        expect(result).to.be.true;
      });
    });

    describe("failure", () => {
      it("should return false when signature is incorrect", async () => {
        const result = await jwtService.verify(incorrectJwtSignature);

        expect(result).to.be.false;
      });

      it("should return false when signature is invalid", async () => {
        jwtService = new JwtService(testPublicKey);

        try {
          await jwtService.verify(invalidJwtSignature);
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
          await jwtService.verify(validJwt);
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
          await jwtService.verify(validJwt);
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

  describe("getPayload", () => {
    describe("success", () => {
      it("should return payload from valid JWT", async () => {
        const result = jwtService.getPayload(validJwt);
        expect(result).to.deep.equal({
          "client-name": "di-auth-stub-relying-party-sandpit",
        });
      });
    });
    describe("failure", () => {
      it("should throw error when passed invalid JWT", async () => {
        try {
          jwtService.getPayload("a");
          assert.fail("Expected error to be thrown");
        } catch (error) {
          expect(error).to.be.an.instanceOf(JwtPayloadParseError);
          expect(error.message).to.equal("JWT was not three elements");
        }
      });
      it("should throw error when passed invalid JWT", async () => {
        try {
          jwtService.getPayload("a.b.c");
          assert.fail("Expected error to be thrown");
        } catch (error) {
          expect(error).to.be.an.instanceOf(SyntaxError);
          expect(error.message).to.equal("Unexpected end of JSON input");
        }
      });
    });
  });
});
