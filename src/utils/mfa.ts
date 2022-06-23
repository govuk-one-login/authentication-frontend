import { authenticator } from "otplib";

export function generateMfaSecret(): string {
  return authenticator.generateSecret(32);
}

export function generateQRCodeValue(secret: string, email: string): string {
  return `otpauth://totp/${email}?secret=${secret}&issuer=GOV.UK%20SignIn&algorithm=SHA1&digits=6&period=30`;
}
