import crypto from "crypto";
import { EncryptionAlgorithmSpec, KMS, } from "@aws-sdk/client-kms";
import { getAwsRegion, getKmsKeyId } from "../../config";
import { DecryptionError } from "../../utils/error";
import { base64DecodeToUint8Array } from "../../utils/encoding";
export class KmsDecryptionService {
    kmsClient;
    encryptionAlgorithm;
    kmsKeyId;
    constructor(kmsClient = new KMS({
        region: getAwsRegion(),
    }), encryptionAlgorithm = EncryptionAlgorithmSpec.RSAES_OAEP_SHA_256, kmsKeyId = getKmsKeyId()) {
        this.kmsClient = kmsClient;
        this.encryptionAlgorithm = encryptionAlgorithm;
        this.kmsKeyId = kmsKeyId;
    }
    async decrypt(encryptedJwe) {
        if (!encryptedJwe) {
            throw new DecryptionError("Invalid JWE input: JWE must be defined");
        }
        if (typeof encryptedJwe !== "string") {
            throw new DecryptionError("Invalid JWE input: JWE must be a string");
        }
        const jweComponents = encryptedJwe.split(".");
        if (jweComponents.length !== 5) {
            throw new DecryptionError("Invalid JWE input: 5 component parts expected");
        }
        try {
            const [protectedHeader, encryptedKey, iv, ciphertext, tag] = jweComponents;
            const contentEncryptionKey = await this.getContentEncryptionKey(encryptedKey);
            const decryptedPayload = await this.decryptPayloadUsingCek(contentEncryptionKey, protectedHeader, iv, ciphertext, tag);
            return new TextDecoder().decode(decryptedPayload);
        }
        catch (err) {
            throw new DecryptionError("Error decrypting JWE", err);
        }
    }
    async getContentEncryptionKey(encryptedKey) {
        const inputs = {
            CiphertextBlob: base64DecodeToUint8Array(encryptedKey),
            EncryptionAlgorithm: this.encryptionAlgorithm,
            KeyId: this.kmsKeyId,
        };
        const decryptResponse = await this.kmsClient.decrypt(inputs);
        return decryptResponse.Plaintext;
    }
    async decryptPayloadUsingCek(contentEncryptionKeyData, protectedHeader, iv, ciphertext, tag) {
        const webcrypto = crypto.webcrypto;
        const cryptoKey = await webcrypto.subtle.importKey("raw", contentEncryptionKeyData, "AES-GCM", false, ["decrypt"]);
        const decryptedBuffer = await webcrypto.subtle.decrypt({
            name: "AES-GCM",
            iv: base64DecodeToUint8Array(iv),
            additionalData: new Uint8Array(Buffer.from(protectedHeader)),
            tagLength: 128,
        }, cryptoKey, Buffer.concat([
            new Uint8Array(base64DecodeToUint8Array(ciphertext)),
            new Uint8Array(base64DecodeToUint8Array(tag)),
        ]));
        return new Uint8Array(decryptedBuffer);
    }
}
