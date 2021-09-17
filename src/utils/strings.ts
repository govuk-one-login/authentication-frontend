import { randomBytes } from "crypto";

export function containsNumber(value: string): boolean {
  return value ? /\d/.test(value) : false;
}

export function containsNumbersOnly(value: string): boolean {
  return value ? /^\d+$/.test(value) : false;
}

export function redactPhoneNumber(value: string): string | undefined {
  return value ? "*******" + value.trim().slice(7) : undefined;
}

export function generateNonce(): string {
  return randomBytes(16).toString("hex");
}
