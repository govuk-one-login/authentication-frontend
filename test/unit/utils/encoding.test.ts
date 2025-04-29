import { describe } from "mocha";
import { assert, expect } from "chai";
import { InvalidBase64Error } from "../../../src/utils/error.js";
import { base64DecodeToUint8Array } from "../../../src/utils/encoding.js";
describe("base64DecodeToUint8Array", () => {
  describe("success", () => {
    it("should return int8array with correct Base64", () => {
      const validBase64 = "dGVzdA==";

      const result = base64DecodeToUint8Array(validBase64);

      expect(result).to.deep.equal(new Uint8Array([116, 101, 115, 116]));
    });
  });

  describe("failure", () => {
    it("should error if null", () => {
      try {
        base64DecodeToUint8Array(null);
        assert.fail("Expected error to be thrown");
      } catch (error) {
        expect(error).to.be.an.instanceOf(TypeError);
        expect(error.message).to.equal(
          "Cannot read properties of null (reading 'length')"
        );
      }
    });

    it("should error if not Base64", () => {
      const invalidBase64 = "df?f";

      try {
        base64DecodeToUint8Array(invalidBase64);
        assert.fail("Expected error to be thrown");
      } catch (error) {
        expect(error).to.be.an.instanceOf(InvalidBase64Error);
        expect(error.message).to.equal(
          `String is not valid base64: ${invalidBase64}`
        );
      }
    });
  });
});
