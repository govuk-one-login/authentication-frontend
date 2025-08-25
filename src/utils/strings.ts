import { randomBytes } from "crypto";
import { promisify } from "util";
import xss from "xss";

export function containsNumber(value: string): boolean {
  return value ? /\d/.test(value) : false;
}

export function containsNumbersOnly(value: string): boolean {
  return value ? /^\d+$/.test(value) : false;
}

export function redactPhoneNumber(value: string): string | undefined {
  return value ? value.trim().slice(value.length - 4) : undefined;
}

const asyncRandomBytes = promisify(randomBytes);

export async function generateNonce(): Promise<string> {
  return (await asyncRandomBytes(16)).toString("hex");
}

export function sanitize(value: string): string {
  let processed = xss(value);
  if (processed) {
    processed = processed.trim();
  }
  return processed;
}

export function splitSecretKeyIntoFragments(secretKey: string): string[] {
  if (secretKey.length > 0) {
    return secretKey.match(/\w{1,4}/g) ?? [];
  }
  return [];
}
