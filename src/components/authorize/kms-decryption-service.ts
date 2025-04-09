import crypto from "crypto";
import {
  DecryptCommandInput,
  DecryptCommandOutput,
  EncryptionAlgorithmSpec,
  KMS,
} from "@aws-sdk/client-kms";
import { KmsDecryptionServiceInterface } from "./types.js";
import { getAwsRegion, getKmsKeyId } from "../../config.js";
import { DecryptionError } from "../../utils/error.js";
import { base64DecodeToUint8Array } from "../../utils/encoding.js";
export class KmsDecryptionService implements KmsDecryptionServiceInterface {
  private kmsClient: KMS;
  private readonly encryptionAlgorithm: EncryptionAlgorithmSpec;
  private readonly kmsKeyId: string;

  constructor(
    kmsClient = new KMS({
      region: getAwsRegion(),
    }),
    encryptionAlgorithm = EncryptionAlgorithmSpec.RSAES_OAEP_SHA_256,
    kmsKeyId = getKmsKeyId()
  ) {
    this.kmsClient = kmsClient;
    this.encryptionAlgorithm = encryptionAlgorithm;
    this.kmsKeyId = kmsKeyId;
  }

  async decrypt(encryptedJwe: string): Promise<string> {
    if (!encryptedJwe) {
      throw new DecryptionError("Invalid JWE input: JWE must be defined");
    }

    if (typeof encryptedJwe !== "string") {
      throw new DecryptionError("Invalid JWE input: JWE must be a string");
    }

    const jweComponents = encryptedJwe.split(".");

    if (jweComponents.length !== 5) {
      throw new DecryptionError(
        "Invalid JWE input: 5 component parts expected"
      );
    }

    try {
      const [protectedHeader, encryptedKey, iv, ciphertext, tag] =
        jweComponents;

      const contentEncryptionKey: Uint8Array =
        await this.getContentEncryptionKey(encryptedKey);
      const decryptedPayload: Uint8Array = await this.decryptPayloadUsingCek(
        contentEncryptionKey,
        protectedHeader,
        iv,
        ciphertext,
        tag
      );
      return new TextDecoder().decode(decryptedPayload);
    } catch (err) {
      throw new DecryptionError("Error decrypting JWE", err);
    }
  }

  private async getContentEncryptionKey(
    encryptedKey: string
  ): Promise<Uint8Array> {
    const inputs: DecryptCommandInput = {
      CiphertextBlob: base64DecodeToUint8Array(encryptedKey),
      EncryptionAlgorithm: this.encryptionAlgorithm,
      KeyId: this.kmsKeyId,
    };

    const decryptResponse: DecryptCommandOutput =
      await this.kmsClient.decrypt(inputs);
    return decryptResponse.Plaintext;
  }

  private async decryptPayloadUsingCek(
    contentEncryptionKeyData: Uint8Array,
    protectedHeader: string,
    iv: string,
    ciphertext: string,
    tag: string
  ): Promise<Uint8Array> {
    const webcrypto = crypto.webcrypto as unknown as Crypto;
    const cryptoKey = await webcrypto.subtle.importKey(
      "raw",
      contentEncryptionKeyData,
      "AES-GCM",
      false,
      ["decrypt"]
    );
    const decryptedBuffer = await webcrypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: base64DecodeToUint8Array(iv),
        additionalData: new Uint8Array(Buffer.from(protectedHeader)),
        tagLength: 128,
      },
      cryptoKey,
      Buffer.concat([
        new Uint8Array(base64DecodeToUint8Array(ciphertext)),
        new Uint8Array(base64DecodeToUint8Array(tag)),
      ])
    );

    return new Uint8Array(decryptedBuffer);
  }
}
