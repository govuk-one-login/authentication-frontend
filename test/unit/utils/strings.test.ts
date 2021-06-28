import { expect } from "chai";
import { describe } from "mocha";
import { containsNumber } from "../../../src/utils/strings";

describe("string-helpers", () => {
  describe("containsNumber", () => {
    it("should return false when string contains no numeric characters", () => {
      expect(containsNumber("test")).to.equal(false);
    });

    it("should return false when string is empty", () => {
      expect(containsNumber("")).to.equal(false);
    });

    it("should return false when string is null", () => {
      expect(containsNumber(null)).to.equal(false);
    });

    it("should return true when string contains numeric characters", () => {
      expect(containsNumber("test123")).to.equal(true);
    });
  });

  describe("hasNumbersOnly", () => {
    it("should return false when string contains text characters", () => {
      expect(containsNumber("test")).to.equal(false);
    });

    it("should return false when string is empty", () => {
      expect(containsNumber("")).to.equal(false);
    });

    it("should return false when string is null", () => {
      expect(containsNumber(null)).to.equal(false);
    });
    it("should return false when string contains alphanumeric characters", () => {
      expect(containsNumber("test123456")).to.equal(true);
    });
    it("should return true when string contains numeric characters only", () => {
      expect(containsNumber("123456")).to.equal(true);
    });
  });
});
