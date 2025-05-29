import { expect } from "chai";
import { describe } from "mocha";
import { getChannelSpecificErrorMessage } from "../../../src/utils/get-channel-specific-error-message.js";
const mappings = {
  "pages.error.specificError": "mobileAppPages.error.specificError",
};

describe("getChannelSpecificErrorMessage", () => {
  describe("where the channel is not an app", () => {
    describe("and the webMessage is not mapped", () => {
      it("should return the original webMessage", () => {
        expect(
          getChannelSpecificErrorMessage("pages.error.unmappedError", false, mappings)
        ).to.equal("pages.error.unmappedError");
      });
    });
    describe("and the webMessage is mapped", () => {
      it("should return the original webMessage", () => {
        expect(
          getChannelSpecificErrorMessage("pages.error.specificError", false, mappings)
        ).to.equal("pages.error.specificError");
      });
    });
  });

  describe("where the channel is an app", () => {
    describe("and the webMessage is not mapped", () => {
      it("should return the original webMessage", () => {
        expect(
          getChannelSpecificErrorMessage("pages.error.unmappedError", true, mappings)
        ).to.equal("pages.error.unmappedError");
      });
    });
    describe("and the webMessage is mapped", () => {
      it("should return the original webMessage", () => {
        expect(
          getChannelSpecificErrorMessage("pages.error.specificError", true, mappings)
        ).to.equal("mobileAppPages.error.specificError");
      });
    });
  });
});
