import { expect } from "chai";
import { describe } from "mocha";
import {
  containsNumber,
  containsNumbersOnly,
  redactPhoneNumber,
  splitSecretKeyIntoFragments,
} from "../../../src/utils/strings.js";
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
      expect(containsNumbersOnly("test")).to.equal(false);
    });

    it("should return false when string is empty", () => {
      expect(containsNumbersOnly("")).to.equal(false);
    });

    it("should return false when string is null", () => {
      expect(containsNumbersOnly(null)).to.equal(false);
    });
    it("should return false when string contains alphanumeric characters", () => {
      expect(containsNumbersOnly("test123456")).to.equal(false);
    });
    it("should return true when string contains numeric characters only", () => {
      expect(containsNumbersOnly("123456")).to.equal(true);
    });
  });

  describe("obfuscatePhoneNumber", () => {
    it("should return obfuscated phone number when valid uk phone number", () => {
      expect(redactPhoneNumber("07700900796")).to.equal("0796");
    });

    it("should return obfuscated phone number when valid international phone number", () => {
      expect(redactPhoneNumber("+330645453322")).to.equal("3322");
    });

    it("should return undefined when phone number is is empty", () => {
      expect(redactPhoneNumber("")).to.equal(undefined);
    });
  });

  describe("splitSecretKeyIntoFragments", () => {
    const validSecretKey = "8X6D7R4BEYF57BEHMHM9YTZMP46JEKEMSTMNELFO6A54NKMNQVCC";

    const secretKeyFragments = splitSecretKeyIntoFragments(validSecretKey);

    it("should split the secret key characters into an array", () => {
      expect(secretKeyFragments).to.be.an("array");
    });

    it("should return an array with length equal to secret key length / 4", () => {
      expect(secretKeyFragments.length).to.be.equal(validSecretKey.length / 4);
    });

    it("should return an array which, when joined, is the same as the original string", () => {
      expect(secretKeyFragments.join("")).to.equal(validSecretKey);
    });

    it("should be able to handle different length keys", () => {
      const differentLengthSecretKeys: string[] = [
        "8X6D7R4BEYF57BEHMHM9YTZMP46JEKEM7R4BEYF57BEHMHM9YTZM",
        "8X6D7R4BEYF57BEHMHM9YTZMP46JEKEM",
        "8X6D7R4BEYF57BEHMHM",
        "X6D7R4BEYF5",
      ];

      differentLengthSecretKeys.forEach((i) => {
        const oddSecretKeyFragments = splitSecretKeyIntoFragments(i);

        it(`should split the characters of ${i} into an array`, () => {
          expect(oddSecretKeyFragments).to.be.an("array");
        });

        it(`should return an array where not item is more than four characters long`, () => {
          oddSecretKeyFragments.forEach((i) => {
            expect(i.length).to.not.be.above(4);
          });
        });

        it(`should return an array which, when joined, is the same as the original string ${i}`, () => {
          expect(oddSecretKeyFragments.join("")).to.equal(validSecretKey);
        });
      });
    });

    it("should be able to handle empty strings", () => {
      const processedEmptyString = splitSecretKeyIntoFragments("");

      it("should return an array when passed and empty string", () => {
        expect(processedEmptyString).to.be.an("array");
      });

      it("should return an empty array when passed an empty string", () => {
        expect(processedEmptyString).to.be.an("array").that.is.empty;
      });
    });
  });
});
