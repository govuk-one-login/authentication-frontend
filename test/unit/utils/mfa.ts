import { expect } from "chai";
import { describe } from "mocha";
import { sinon } from "../../utils/test-utils";
import { generateMfaSecret, generateQRCodeValue } from "../../../src/utils/mfa";
import { APP_ENV_NAME } from "../../../src/app.constants";

describe("mfa", () => {
  describe("generateMfaSecret", () => {
    it("should return a secret with a length of 32 chars", () => {
      const secret = generateMfaSecret();
      expect(secret.length).to.equal(32);
    });
  });

  describe("generateQRCodeValue", () => {
    it("should generate QR code value for a production environment", () => {
      sinon.stub(process, "env").value({ APP_ENV: APP_ENV_NAME.PROD });
      const expected = `otpauth://totp/GOV.UK:test%40test.com?secret=testsecret&period=30&digits=6&algorithm=SHA1&issuer=GOV.UK`;
      expect(
        generateQRCodeValue("testsecret", "test@test.com", "GOV.UK")
      ).to.equal(expected);
    });
    it("should generate QR code value for a non-production environment", () => {
      sinon.stub(process, "env").value({ APP_ENV: "testenv" });
      const expected = `otpauth://totp/GOV.UK%20-%20testenv:test%40test.com?secret=testsecret&period=30&digits=6&algorithm=SHA1&issuer=GOV.UK%20-%20testenv`;
      expect(
        generateQRCodeValue("testsecret", "test@test.com", "GOV.UK")
      ).to.equal(expected);
    });
  });
});
