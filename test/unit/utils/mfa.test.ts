import { expect } from "chai";
import { describe } from "mocha";
import { generateMfaSecret, generateQRCodeValue } from "../../../src/utils/mfa.js";
describe("mfa", () => {
  describe("generateMfaSecret", () => {
    it("should return a secret with a length of 32 chars", () => {
      const secret = generateMfaSecret();
      expect(secret.length).to.equal(32);
    });
  });

  describe("generateQRCodeValue", () => {
    it("should generate QR code value with correct inputs", () => {
      const actual = generateQRCodeValue("testsecret", "test@test.com", "GOV.UK SignIn");

      const expected =
        "otpauth://totp/GOV.UK%20SignIn%20-%20local:test%40test.com?secret=testsecret&period=30&digits=6&algorithm=SHA1&issuer=GOV.UK%20SignIn%20-%20local";
      expect(actual).to.equal(expected);
    });
  });
});
