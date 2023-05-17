import {
  authenticatorGenerateSecret,
  HashAlgorithms,
  KeyEncodings,
  keyuri,
  Strategy,
} from "@otplib/core";
import * as base32EncDec from "@otplib/plugin-base32-enc-dec";
import crypto from "crypto";
import { APP_ENV_NAME } from "../app.constants";
import { getAppEnv } from "../config";

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
  return authenticatorGenerateSecret(20, options);
}

export function generateQRCodeValue(
  secret: string,
  email: string,
  issuerName: string
): string {
  const issuer =
    getAppEnv() === APP_ENV_NAME.PROD
      ? issuerName
      : `${issuerName} - ${getAppEnv()}`;
  return keyuri({
    accountName: email,
    secret: secret,
    algorithm: HashAlgorithms.SHA1,
    digits: 6,
    step: 30,
    issuer: issuer,
    type: Strategy.TOTP,
  });
}
