import { expect } from "chai";
import { describe } from "mocha";
import { generateMfaSecret, generateQRCodeValue } from "../../../src/utils/mfa";

describe("mfa", () => {
  describe("generateMfaSecret", () => {
    it("should return a secret with a length of 52 chars", () => {
      const secret = generateMfaSecret();
      expect(secret.length).to.equal(52);
    });
  });

  describe("generateQRCodeValue", () => {
    it("should generate QR code value with correct inputs", () => {
      const expected =
        "otpauth://totp/test@test.com?secret=testsecret&issuer=GOV.UK%20SignIn&algorithm=SHA1&digits=6&period=30";
      expect(generateQRCodeValue("testsecret", "test@test.com")).to.equal(
        expected
      );
    });
  });
});
