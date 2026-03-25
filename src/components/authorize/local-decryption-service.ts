import * as jose from "jose";
import type { DecryptionServiceInterface } from "./types.js";
import { getLocalEncryptionKey } from "../../config.js";

const decoder = new TextDecoder();

export class LocalDecryptionService implements DecryptionServiceInterface {
  async decrypt(serializedJwe: string): Promise<string> {
    const key = await jose.importPKCS8(getLocalEncryptionKey(), "RSA-OAEP-256");
    const result = await jose.compactDecrypt(serializedJwe, key);
    return decoder.decode(result.plaintext);
  }
}
