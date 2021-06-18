import { expect } from "chai";
import { describe } from "mocha";
import { containsNumber } from "../../../src/utils/string-helpers";

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
});
