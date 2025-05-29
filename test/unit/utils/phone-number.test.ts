import { expect } from "chai";
import { describe } from "mocha";
import {
  containsInternationalMobileNumber,
  containsUKMobileNumber,
  lengthInRangeWithoutSpaces,
  convertInternationalPhoneNumberToE164Format,
  returnLastCharactersOnly,
} from "../../../src/utils/phone-number.js";
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

    it("should return true when Isle of Man phone number entered", () => {
      expect(containsUKMobileNumber("+44 7624 311111")).to.equal(true);
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

    it("should return true with a notify test number", () => {
      expect(containsUKMobileNumber("07700900222")).to.equal(true);
    });

    it("should return true with leading +44 before 0", () => {
      expect(containsUKMobileNumber("+4407911123456")).to.equal(true);
    });

    it("should return true with leading +44 without 0", () => {
      expect(containsUKMobileNumber("+447911123456")).to.equal(true);
    });

    it("should return false when starting with +33 before 0", () => {
      expect(containsUKMobileNumber("+330645453322")).to.equal(false);
    });

    it("should return false when starting with +33 without 0", () => {
      expect(containsUKMobileNumber("+33645453322")).to.equal(false);
    });

    it("should return false when starting with 0033", () => {
      expect(containsUKMobileNumber("0033 645453322")).to.equal(false);
    });

    it("should return false when only a single 4 is present", () => {
      expect(containsUKMobileNumber("+47911123456")).to.equal(false);
    });

    it("should return false when missing 7", () => {
      expect(containsUKMobileNumber("+44911123456")).to.equal(false);
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
      expect(lengthInRangeWithoutSpaces(" 123 45 678 901 ", 11, 11)).to.equal(true);
    });
  });

  describe("test international uk mobile numbers", () => {
    it("should return true with valid uk mobile domestic", () => {
      expect(containsUKMobileNumber("07911123456")).to.equal(true);
    });

    it("should return true with valid uk mobile", () => {
      expect(containsUKMobileNumber("00447911123456")).to.equal(true);
    });

    it("should return true with valid uk mobile in E164", () => {
      expect(containsUKMobileNumber("+447911123456")).to.equal(true);
    });

    it("should return true with valid uk mobile in E164 with zero", () => {
      expect(containsUKMobileNumber("+4407911123456")).to.equal(true);
    });

    it("should return false with valid uk mobile without lib country code", () => {
      expect(containsInternationalMobileNumber("07911123456")).to.equal(false);
    });

    it("should return true with valid uk mobile without lib country code", () => {
      expect(containsInternationalMobileNumber("00447911123456")).to.equal(true);
    });

    it("should return true with valid uk mobile in E164 without lib country code", () => {
      expect(containsInternationalMobileNumber("+447911123456")).to.equal(true);
    });

    it("should return true with valid uk mobile in E164 without lib country code with zero", () => {
      expect(containsInternationalMobileNumber("+4407911123456")).to.equal(true);
    });
  });

  describe("test international French mobile numbers", () => {
    it("should return false with valid French mobile without lib country code", () => {
      expect(containsInternationalMobileNumber("0645453322")).to.equal(false);
    });

    it("should return true with valid French mobile without lib country code", () => {
      expect(containsInternationalMobileNumber("0033645453322")).to.equal(true);
    });

    it("should return true with valid French mobile in E164 without lib country code", () => {
      expect(containsInternationalMobileNumber("+33645453322")).to.equal(true);
    });

    it("should return true with valid French mobile in E164 without lib country code with zero", () => {
      expect(containsInternationalMobileNumber("+330645453322")).to.equal(true);
    });
  });

  describe("test international Spanish mobile numbers", () => {
    it("should return false with valid Spanish mobile without lib country code", () => {
      expect(containsInternationalMobileNumber("608453322")).to.equal(false);
    });

    it("should return true with valid Spanish mobile without lib country code", () => {
      expect(containsInternationalMobileNumber("0034608453322")).to.equal(true);
    });

    it("should return true with valid Spanish mobile in E164 without lib country code", () => {
      expect(containsInternationalMobileNumber("+34608453322")).to.equal(true);
    });
  });

  describe("convertInternationalPhoneNumberToE164Format", () => {
    it("should prepend + to an international number without the prefix", () => {
      expect(convertInternationalPhoneNumberToE164Format("34608453322")).to.equal(
        "+34608453322"
      );
    });

    it("should not prepend + to an international number with the prefix", () => {
      expect(convertInternationalPhoneNumberToE164Format("+34608453322")).to.equal(
        "+34608453322"
      );
    });

    it("should swap out a 00 for a + when the input uses this format", () => {
      expect(convertInternationalPhoneNumberToE164Format("0034608453322")).to.equal(
        "+34608453322"
      );
    });
  });

  describe("returnLastCharacters", () => {
    it("should return the last four characters where no limit is set in the options", () => {
      expect(returnLastCharactersOnly("1234567890")).to.equal("7890");
    });
    it("should return a string of length equal to the limit set", () => {
      [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach((i) => {
        expect(returnLastCharactersOnly("1234567890", { limit: i }).length).to.equal(i);
      });
    });
    it("should return an empty string if passed empty string", () => {
      expect(returnLastCharactersOnly("", { limit: 3 })).to.equal("");
    });
  });
});
