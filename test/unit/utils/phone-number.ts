import { expect } from "chai";
import { describe } from "mocha";
import {
  containsNumbersOrSpacesOnly,
  containsUKMobileNumber,
} from "../../../src/utils/phone-number";

describe("phone-number", () => {
  describe("containsUKMobileNumber", () => {
    it("should return false when text entered as UK phone number", () => {
      expect(containsUKMobileNumber("test")).to.equal(false);
    });

    it("should return false when number too short", () => {
      expect(containsUKMobileNumber("1234")).to.equal(false);
    });

    it("should return false when non UK phone number entered", () => {
      expect(containsUKMobileNumber("541 754-3010")).to.equal(false);
    });

    it("should return true when UK mobile phone number entered", () => {
      expect(containsUKMobileNumber("07911 123456")).to.equal(true);
    });

    it("should return true when UK landline number entered", () => {
      expect(containsUKMobileNumber("020 3451 9000")).to.equal(true);
    });
  });

  describe("containsNumbersOrSpacesOnly", () => {
    it("should return false when non numeric character is in string", () => {
      expect(containsNumbersOrSpacesOnly("test")).to.equal(false);
    });

    it("should return false when symbol is in string", () => {
      expect(containsNumbersOrSpacesOnly("!!")).to.equal(false);
    });

    it("should return false when spaces only in string", () => {
      expect(containsNumbersOrSpacesOnly("   ")).to.equal(false);
    });

    it("should return true when numbers only in string", () => {
      expect(containsNumbersOrSpacesOnly("1234567")).to.equal(true);
    });

    it("should return true when spaces and numbers in string", () => {
      expect(containsNumbersOrSpacesOnly("123 4567 33")).to.equal(true);
    });
  });
});
