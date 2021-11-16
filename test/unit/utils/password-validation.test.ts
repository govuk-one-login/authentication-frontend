import { expect } from "chai";
import { describe } from "mocha";
import { isCommonPassword } from "../../../src/utils/password-validation";

describe("password-validation", () => {
  describe("commonPassword", () => {
    it("should return true when password is in common password list", () => {
      expect(isCommonPassword("password")).to.equal(true);
    });
    it("should return false when password is not in common password list", () => {
      expect(isCommonPassword("arthnfk174_g2")).to.equal(false);
    });
  });
});
