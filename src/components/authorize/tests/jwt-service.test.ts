import { beforeEach, describe } from "mocha";
import { assert, expect } from "chai";
import { JwtService } from "../jwt-service.js";
import {
  JwtValidationError,
  JwtClaimsValueError,
} from "../../../utils/error.js";
import type { Claims } from "../claims-config.js";
import { getKnownClaims } from "../claims-config.js";
import {
  createJwt,
  createMockClaims,
  getPrivateKey,
  getPublicKey,
} from "./test-data.js";
import type { KeyLike, GenerateKeyPairResult, JWK } from "jose";
import { generateKeyPair, exportSPKI, exportJWK, importSPKI } from "jose";
import sinon from "sinon";
import esmock from "esmock";

describe("JWT service", () => {
  let claims: Claims;
  let publicKey: string;
  let privateKey: KeyLike;
  let publicJwk: JWK;
  let wrongPrivateKey: KeyLike;
  let wrongPublicJwk: JWK;
  let validJwt: string;
  let jwtService: JwtService;

  beforeEach(async () => {
    claims = createMockClaims();
    publicKey = getPublicKey();
    privateKey = await getPrivateKey();
    const publicKeyLike = await importSPKI(publicKey, "ES256");
    publicJwk = await exportJWK(publicKeyLike);
    const wrongKeyPair = await generateKeyPair("ES256");
    wrongPrivateKey = wrongKeyPair.privateKey;
    wrongPublicJwk = await exportJWK(wrongKeyPair.privateKey);
    validJwt = await createJwt(createMockClaims(), privateKey, publicJwk.kid);
    jwtService = await createJwtServiceWithJwksKey(publicJwk);
    process.env.API_BASE_URL = "http://localhost";
  });

  describe("getPayloadWithValidation", () => {
    it("should return payload from valid JWT", async () => {
      const result = await jwtService.getPayloadWithValidation(validJwt);
      expect(result).to.deep.equal(createMockClaims());
    });

    it("should consider a jwt with a reautheticate claim as valid", async () => {
      const jwtWithReautheticateClaim = createMockClaims();
      jwtWithReautheticateClaim.reauthenticate = "123456";
      const jwt = await createJwt(jwtWithReautheticateClaim, privateKey);

      const result = await jwtService.getPayloadWithValidation(jwt);
      expect(result).to.deep.equal(jwtWithReautheticateClaim);
    });

    describe("stub key validation", () => {
      let stubKeyPair: GenerateKeyPairResult;
      let stubPublicKey: string;
      let jwtService: JwtService;
      let validStubJwt: string;

      beforeEach(async () => {
        stubKeyPair = await generateKeyPair("ES256");
        stubPublicKey = await exportSPKI(stubKeyPair.publicKey);
        const stubPublicKeyLike = await importSPKI(publicKey, "ES256");
        const stubPublicJwk = await exportJWK(stubPublicKeyLike);
        jwtService = createJwtServiceWithStubKey(stubPublicKey);
        validStubJwt = await createJwt(
          createMockClaims(),
          stubKeyPair.privateKey,
          stubPublicJwk.kid
        );
      });

      it("should fail signature validation with hardcoded key, then pass signature validation with stub key", async () => {
        const jwt = await createJwt(createMockClaims(), stubKeyPair.privateKey);

        const result = await jwtService.getPayloadWithValidation(jwt);

        expect(result).to.deep.equal(createMockClaims());
      });

      it("should fail signature validation with JWKS key, then pass signature validation with stub key", async () => {
        const jwt = await createJwt(createMockClaims(), stubKeyPair.privateKey);
        jwtService = await createJwtServiceWithJwksKeyAndStubKey(
          wrongPublicJwk,
          stubPublicKey
        );

        const result = await jwtService.getPayloadWithValidation(jwt);

        expect(result).to.deep.equal(createMockClaims());
      });

      it("should accept standard payloads when a stub key is present", async () => {
        const result = await jwtService.getPayloadWithValidation(validStubJwt);

        expect(result).to.deep.equal(createMockClaims());
      });

      it("should reject invalid payloads when a stub key is present", async () => {
        const jwt = await createJwt(createMockClaims(), wrongPrivateKey);

        try {
          await jwtService.getPayloadWithValidation(jwt);
          assert.fail("Expected error to be thrown");
        } catch (error) {
          expect(error).to.be.an.instanceOf(JwtValidationError);
        }
      });
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

      it("should not throw error and fetch public key from jwks if JWKS feature flag enabled", async () => {
        const result = await jwtService.getPayloadWithValidation(validJwt);

        expect(result).to.deep.equal(createMockClaims());
      });

      it("should throw error when jwt isn't signed with the correct public key", async () => {
        const jwtWrongSig = await createJwt(
          createMockClaims(),
          wrongPrivateKey,
          "a-different-kid"
        );

        try {
          await jwtService.getPayloadWithValidation(jwtWrongSig);
          assert.fail("Expected error to be thrown");
        } catch (error) {
          expect(error).to.be.an.instanceOf(JwtValidationError);
          expect(error.message).to.equal("signature verification failed");
        }
      });

      it("should throw error when jwt contains invalid claim object", async () => {
        const claims = createMockClaims();
        claims["claim"] = "not a json";

        const jwtWithInvalidClaimObject = await createJwt(
          claims,
          privateKey,
          publicJwk.kid
        );

        try {
          await jwtService.getPayloadWithValidation(jwtWithInvalidClaimObject);
          assert.fail("Expected error to be thrown");
        } catch (error) {
          expect(error).to.be.an.instanceOf(JwtValidationError);
          expect(error.message).to.equal(
            "claim object is not a valid json object"
          );
        }
      });

      it("should pass validation when jwt does not contain claim object", async () => {
        const claims = createMockClaims();
        delete claims["claim"];

        const jwtWithoutClaimObject = await createJwt(
          claims,
          privateKey,
          publicJwk.kid
        );
        const result = await jwtService.getPayloadWithValidation(
          jwtWithoutClaimObject
        );
        expect(result).to.deep.equal(claims);
      });
    });

    describe("Validate Generic Claims", () => {
      it("should throw error if missing claims", async () => {
        Object.keys(claims).forEach(async (claim) => {
          const withoutClaim = { ...claims };
          try {
            delete withoutClaim[claim as keyof Claims];
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

    describe("Validate Claims claim object", () => {
      it("should return claims if a valid claim object", async () => {
        const claimObject =
          '{"userinfo": {"email_verified": null, "public_subject_id": null, "email": null}}';
        expect(jwtService.validateClaimObject(claimObject)).to.be.deep.equal(
          claimObject
        );
      });

      it("should return claims if a invalid claim object", async () => {
        const claimObject = "not a json string";

        try {
          jwtService.validateClaimObject(claimObject);
          assert.fail("Expected error to be thrown");
        } catch (error) {
          expect(error).to.be.an.instanceOf(JwtValidationError);
          expect(error.message).to.equal(
            "claim object is not a valid json object"
          );
        }
      });
    });

    describe("validateCustomClaims", () => {
      let claims: any;
      beforeEach(() => {
        claims = createMockClaims();
      });

      it("should return claims if correctly supplied", () => {
        expect(jwtService.validateCustomClaims(claims)).to.be.deep.equal(
          claims
        );
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
});
const createJwtServiceWithJwksKey = async (
  jwksKey: JWK
): Promise<JwtService> => {
  const { JwtService } = await esmock("../jwt-service.ts", {
    jose: {
      createRemoteJWKSet: sinon.stub().callsFake((): KeyLike => {
        return jwksKey as unknown as KeyLike;
      }),
    },
  });
  return new JwtService("");
};
const createJwtServiceWithStubKey = (stubKey: string): JwtService => {
  return new JwtService(stubKey);
};
const createJwtServiceWithJwksKeyAndStubKey = async (
  jwksKey: JWK,
  stubKey: string
): Promise<JwtService> => {
  const { JwtService } = await esmock("../jwt-service.ts", {
    jose: {
      createRemoteJWKSet: sinon.stub().callsFake((): KeyLike => {
        return jwksKey as unknown as KeyLike;
      }),
    },
  });
  return new JwtService(stubKey);
};
