import {
  authenticatorGenerateSecret,
  HashAlgorithms,
  KeyEncodings,
  keyuri,
  Strategy,
} from "@otplib/core";
import * as base32EncDec from "@otplib/plugin-base32-enc-dec";
import crypto from "crypto";

function createRandomBytes(size: number, encoding: KeyEncodings): string {
  return crypto.randomBytes(size).toString(encoding);
}

export function generateMfaSecret(): string {
  const options = {
    createRandomBytes,
    encoding: KeyEncodings.HEX,
    keyEncoder: base32EncDec.keyEncoder,
    keyDecoder: base32EncDec.keyDecoder,
  };
  return authenticatorGenerateSecret(32, options);
}

export function generateQRCodeValue(secret: string, email: string): string {
  return keyuri({
    accountName: email,
    secret: secret,
    algorithm: HashAlgorithms.SHA1,
    digits: 6,
    step: 30,
    issuer: "GOV.UK SignIn",
    type: Strategy.TOTP,
  });
}
