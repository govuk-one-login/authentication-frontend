import { getOrchStubToAuthSigningPublicKey, getOrchToAuthSigningPublicKey, } from "../../config";
import { JwtClaimsValueError, JwtValidationError } from "../../utils/error";
import { requiredClaimsKeys, getKnownClaims, getKnownStubClaims, } from "./claims-config";
import * as jose from "jose";
export class JwtService {
    publicKey;
    stubPublicKey;
    constructor(publicKey = getOrchToAuthSigningPublicKey(), stubPublicKey = getOrchStubToAuthSigningPublicKey()) {
        this.publicKey = publicKey;
        this.stubPublicKey = stubPublicKey;
    }
    async getPayloadWithValidation(jwt) {
        let claims;
        try {
            claims = await this.validate(jwt);
        }
        catch (error) {
            throw new JwtValidationError(error.message);
        }
        if (claims["claim"] !== undefined) {
            this.validateClaimObject(claims["claim"]);
        }
        return this.validateCustomClaims(claims);
    }
    async validate(jwt) {
        try {
            return await this.validateUsingKey(jwt, this.publicKey);
        }
        catch (error) {
            if (this.stubPublicKey === "" || this.stubPublicKey === "UNKNOWN") {
                throw error;
            }
            return await this.validateUsingKey(jwt, this.stubPublicKey);
        }
    }
    async validateUsingKey(jwt, key) {
        const keyObject = await jose.importSPKI(key, "ES256");
        const result = await jose.jwtVerify(jwt, keyObject, {
            requiredClaims: requiredClaimsKeys,
            clockTolerance: 30,
        });
        return result.payload;
    }
    validateCustomClaims(claims) {
        const requiredClaims = getKnownClaims();
        const stubClaims = getKnownStubClaims();
        Object.keys(requiredClaims).forEach((claim) => {
            if (requiredClaims[claim] !== claims[claim] &&
                stubClaims[claim] !== claims[claim]) {
                throw new JwtClaimsValueError(`${claim} has incorrect value`);
            }
        });
        return claims;
    }
    validateClaimObject(claim) {
        try {
            JSON.parse(claim);
            return claim;
        }
        catch {
            throw new JwtValidationError("claim object is not a valid json object");
        }
    }
}
