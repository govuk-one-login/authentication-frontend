import { beforeEach, describe } from "mocha";
import { assert, expect } from "chai";
import { JwtService } from "../jwt-service";
import { JwtValidationError, JwtClaimsValueError } from "../../../utils/error";
import { getKnownClaims } from "../claims-config";
import {
  createJwt,
  createmockclaims,
  getPrivateKey,
  getWrongPrivateKey,
  getPublicKey,
} from "./test-data";
import { KeyLike } from "jose";

describe("JWT service", () => {
  let claims: any;
  let publicKey: string;
  let privateKey: KeyLike;
  let wrongPrivateKey: KeyLike;
  let validJwt: string;
  let jwtService: JwtService;

  beforeEach(async () => {
    claims = createmockclaims();
    publicKey = getPublicKey();
    privateKey = await getPrivateKey();
    wrongPrivateKey = await getWrongPrivateKey();
    validJwt = await createJwt(createmockclaims(), privateKey);
    jwtService = new JwtService(publicKey);
  });

  describe("getPayloadWithValidation", () => {
    it("should return payload from valid JWT", async () => {
      const result = await jwtService.getPayloadWithValidation(validJwt);
      expect(result).to.deep.equal(createmockclaims());
    });

    describe("Validate jwt", () => {
      it("should throw an error when passed non-JWT format", async () => {
        try {
          await jwtService.getPayloadWithValidation("a");
          assert.fail("Expected error to be thrown");
        } catch (error) {
          expect(error).to.be.an.instanceOf(JwtValidationError);
          expect(error.message).to.equal("Invalid Compact JWS");
        }
      });

      it("should throw error when header incorrect", async () => {
        jwtService = new JwtService(publicKey);
        const [, payload, sig] = validJwt.split(".");
        const modified = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${payload}.${sig}`;
        try {
          await jwtService.getPayloadWithValidation(modified);
          assert.fail("Expected error to be thrown");
        } catch (error) {
          expect(error).to.be.an.instanceOf(JwtValidationError);
        }
      });

      it("should throw error when jwt payload changed", async () => {
        jwtService = new JwtService(publicKey);
        const [header, , sig] = validJwt.split(".");

        const modified = `${header}.eyJjbGllbnQtbmFtZSI6ImRpLWF1dGgtc3R1Yi1yZWx5aW5nLXBhcnR5LXNhbmRwaXQifQ.${sig}`;
        try {
          await jwtService.getPayloadWithValidation(modified);
          assert.fail("Expected error to be thrown");
        } catch (error) {
          expect(error).to.be.an.instanceOf(JwtValidationError);
          expect(error.message).to.equal("signature verification failed");
        }
      });

      it("should throw error when jwt isn't signed with the correct public key", async () => {
        const JwtWrongSig = await createJwt(
          createmockclaims(),
          wrongPrivateKey
        );
        jwtService = new JwtService(publicKey);

        try {
          await jwtService.getPayloadWithValidation(JwtWrongSig);
          assert.fail("Expected error to be thrown");
        } catch (error) {
          expect(error).to.be.an.instanceOf(JwtValidationError);
          expect(error.message).to.equal("signature verification failed");
        }
      });
    });

    describe("Validate Generic Claims", () => {
      it("should throw error if missing claims", async () => {
        Object.keys(claims).forEach(async (claim) => {
          const withoutClaim = { ...claims };
          try {
            delete withoutClaim[claim];
            const jwtMissingClaim = await createJwt(withoutClaim, privateKey);
            jwtService.getPayloadWithValidation(jwtMissingClaim);
            assert.fail("Expected error to be thrown");
          } catch (error) {
            expect(error).to.be.an.instanceOf(JwtValidationError);
            expect(error.message).to.equal(`${claim} claim missing`);
          }
        });
      });

      it("should throw error if Token expired", async () => {
        const now: number = Math.floor(new Date().getTime() / 1000);
        claims.exp = now - 1000;
        try {
          const expiredJwt = await createJwt(claims, privateKey);
          await jwtService.getPayloadWithValidation(expiredJwt);
          assert.fail("Expected error to be thrown");
        } catch (error) {
          expect(error).to.be.an.instanceOf(JwtValidationError);
          expect(error.message).to.equal('"exp" claim timestamp check failed');
        }
      });

      it("should throw error if Token before nbf timestamp", async () => {
        const now: number = Math.floor(new Date().getTime() / 1000);
        claims.nbf = now + 1000;
        try {
          const nbfJwt = await createJwt(claims, privateKey);
          await jwtService.getPayloadWithValidation(nbfJwt);
          assert.fail("Expected error to be thrown");
        } catch (error) {
          expect(error).to.be.an.instanceOf(JwtValidationError);
          expect(error.message).to.equal('"nbf" claim timestamp check failed');
        }
      });
    });
  });

  describe("validateCustomClaims", () => {
    let claims: any;
    beforeEach(() => {
      claims = createmockclaims();
    });

    it("should return claims if correctly supplied", () => {
      expect(jwtService.validateCustomClaims(claims)).to.be.deep.equal(claims);
    });

    it("should throw error if incorrect value for claim", () => {
      const knowClaim = Object.keys(getKnownClaims())[0];
      claims[knowClaim] = "Incorrect value";

      try {
        jwtService.validateCustomClaims(claims);
        assert.fail("Expected error to be thrown");
      } catch (error) {
        expect(error).to.be.an.instanceOf(JwtClaimsValueError);
        expect(error.message).to.equal(`${knowClaim} has incorrect value`);
      }
    });
  });
});
