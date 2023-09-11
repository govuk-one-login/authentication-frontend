import { expect } from "chai";
import { describe } from "mocha";
import { generateMfaSecret, generateQRCodeValue } from "../../../src/utils/mfa";

describe("mfa", () => {
  describe("generateMfaSecret", () => {
    it("should return a secret with a length of 32 chars", () => {
      const secret = generateMfaSecret();
      expect(secret.length).to.equal(32);
    });
  });

  describe("generateQRCodeValue", () => {
    it("should generate QR code value with correct inputs", () => {
      const secret = "testSecret";
      const email = "test@test.com";
      const urlEncodedEmail = "test%40test.com";
      const issuerName = "GOV.UK SignIn";
      const urlEncodedIssuerName = "GOV.UK%20SignIn%20-%20local";

      const expected = `otpauth://totp/${urlEncodedIssuerName}:${urlEncodedEmail}?secret=${secret}&period=30&digits=6&algorithm=SHA1&issuer=${urlEncodedIssuerName}`;
      expect(generateQRCodeValue(secret, email, issuerName)).to.equal(expected);
    });
  });
});
