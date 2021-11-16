import { expect } from "chai";
import { describe } from "mocha";
import {
  containsNumbersOrSpacesOnly,
  containsUKMobileNumber,
  lengthInRangeWithoutSpaces,
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

    it("should return false when invalid UK mobile phone number entered", () => {
      expect(containsUKMobileNumber("06911123456")).to.equal(false);
    });

    it("should return false when London UK landline number entered", () => {
      expect(containsUKMobileNumber("020 7946 0000")).to.equal(false);
    });

    it("should return false when Edinburgh UK landline number entered", () => {
      expect(containsUKMobileNumber("01314960001")).to.equal(false);
    });

    it("should return false when no area UK landline number entered", () => {
      expect(containsUKMobileNumber("01632 960999")).to.equal(false);
    });

    it("should return false when UK wide landline number entered", () => {
      expect(containsUKMobileNumber("03069 990000 ")).to.equal(false);
    });

    it("should return false when freephone number entered", () => {
      expect(containsUKMobileNumber("08081 570000")).to.equal(false);
    });

    it("should return false when premium rate number entered", () => {
      expect(containsUKMobileNumber("0909 8790000")).to.equal(false);
    });
  });

  describe("containsNumbersOrSpacesOnly", () => {
    it("should return false when non numeric character is in string", () => {
      expect(containsNumbersOrSpacesOnly("test")).to.equal(false);
    });

    it("should return false when symbol is in string", () => {
      expect(containsNumbersOrSpacesOnly("!!")).to.equal(false);
    });

    it("should return true when spaces only in string", () => {
      expect(containsNumbersOrSpacesOnly("   ")).to.equal(true);
    });

    it("should return true when numbers only in string", () => {
      expect(containsNumbersOrSpacesOnly("1234567")).to.equal(true);
    });

    it("should return true when spaces and numbers in string", () => {
      expect(containsNumbersOrSpacesOnly("123 4567 33")).to.equal(true);
    });
  });

  describe("lengthInRangeWithoutSpaces", () => {
    it("should return true when empty and between 0 and 0", () => {
      expect(lengthInRangeWithoutSpaces("", 0, 0)).to.equal(true);
    });

    it("should return false when empty and between 1 and 2", () => {
      expect(lengthInRangeWithoutSpaces("", 1, 2)).to.equal(false);
    });

    it("should return true when 1 space only and between 0 and 0", () => {
      expect(lengthInRangeWithoutSpaces(" ", 0, 0)).to.equal(true);
    });

    it("should return true when 3 spaces only and between 0 and 0", () => {
      expect(lengthInRangeWithoutSpaces("   ", 0, 0)).to.equal(true);
    });

    it("should return true with leading space and 5 chars", () => {
      expect(lengthInRangeWithoutSpaces(" 12345", 5, 5)).to.equal(true);
    });

    it("should return true with trailing space and 5 chars", () => {
      expect(lengthInRangeWithoutSpaces("12345 ", 5, 5)).to.equal(true);
    });

    it("should return true with middle space and 5 chars", () => {
      expect(lengthInRangeWithoutSpaces("123 45", 5, 5)).to.equal(true);
    });

    it("should return false with leading space and 5 chars with range above", () => {
      expect(lengthInRangeWithoutSpaces(" 12345", 6, 7)).to.equal(false);
    });

    it("should return false with trailing space and 5 chars with range above", () => {
      expect(lengthInRangeWithoutSpaces("12345 ", 6, 7)).to.equal(false);
    });

    it("should return false with middle space and 5 chars with range above", () => {
      expect(lengthInRangeWithoutSpaces("123 45", 6, 7)).to.equal(false);
    });

    it("should return false with leading space and 5 chars with range below", () => {
      expect(lengthInRangeWithoutSpaces(" 12345", 3, 4)).to.equal(false);
    });

    it("should return false with trailing space and 5 chars with range below", () => {
      expect(lengthInRangeWithoutSpaces("12345 ", 3, 4)).to.equal(false);
    });

    it("should return false with middle space and 5 chars with range below", () => {
      expect(lengthInRangeWithoutSpaces("123 45", 3, 4)).to.equal(false);
    });

    it("should return true with numbers and spaces in range", () => {
      expect(lengthInRangeWithoutSpaces(" 123 45 678 901 ", 11, 11)).to.equal(
        true
      );
    });
  });
});
