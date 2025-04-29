import {
  authenticatorGenerateSecret,
  HashAlgorithms,
  KeyEncodings,
  keyuri,
  Strategy,
} from "@otplib/core";
import * as base32EncDec from "@otplib/plugin-base32-enc-dec";
import crypto from "crypto";
import { APP_ENV_NAME, MFA_METHOD_TYPE } from "../app.constants.js";
import { getAppEnv } from "../config.js";
import type { MfaMethod, SmsMfaMethod } from "../types.js";
import { isSmsMfaMethod, MfaMethodPriorityIdentifier } from "../types.js";

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

export function upsertDefaultSmsMfaMethod(
  mfaMethodArray: MfaMethod[] | undefined,
  newMfaMethod: Partial<SmsMfaMethod>
): MfaMethod[] {
  const previousMfaMethods = mfaMethodArray || [];
  const index = previousMfaMethods.findIndex(
    (mfaMethod: MfaMethod) => mfaMethod.type === MFA_METHOD_TYPE.SMS
  );

  const previousMfa = index > -1 && previousMfaMethods[index];
  const nextMfa: MfaMethod = {
    ...previousMfa,
    type: MFA_METHOD_TYPE.SMS,
    priorityIdentifier: MfaMethodPriorityIdentifier.DEFAULT,
    ...(newMfaMethod.redactedPhoneNumber && {
      redactedPhoneNumber: newMfaMethod.redactedPhoneNumber,
    }),
    ...(newMfaMethod.phoneNumber && {
      phoneNumber: newMfaMethod.phoneNumber,
    }),
  };

  const nextMfaMethods = previousMfaMethods.slice();
  if (previousMfa) {
    nextMfaMethods.splice(index, 1, nextMfa);
  } else {
    nextMfaMethods.push(nextMfa);
  }
  return nextMfaMethods;
}

export function getDefaultSmsMfaMethod(
  mfaMethods: MfaMethod[] | undefined
): SmsMfaMethod | undefined {
  if (!mfaMethods) return undefined;
  return mfaMethods
    .filter(isSmsMfaMethod)
    .find(
      (mfaMethod) =>
        mfaMethod.priorityIdentifier === MfaMethodPriorityIdentifier.DEFAULT
    );
}

export function removeDefaultSmsMfaMethod(
  mfaMethod: MfaMethod[] | undefined
): MfaMethod[] {
  if (!mfaMethod) return undefined;
  return mfaMethod.filter(
    (mfaMethod) =>
      !(
        mfaMethod.priorityIdentifier === MfaMethodPriorityIdentifier.DEFAULT &&
        isSmsMfaMethod(mfaMethod)
      )
  );
}
