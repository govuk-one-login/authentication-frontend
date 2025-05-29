import { expect } from "chai";
import { describe } from "mocha";
import { getChannelSpecificTemplate } from "../../../src/utils/get-channel-specific-template.js";
const mappings = {
  "webTemplate.njk": "mobileTemplate.njk",
};

describe("getChannelSpecificTemplate", () => {
  describe("where the channel is not an app", () => {
    describe("and the webTemplateAndPath is not mapped", () => {
      it("should return the original webTemplateAndPath", () => {
        expect(
          getChannelSpecificTemplate("notMappedTemplate.njk", false, mappings)
        ).to.equal("notMappedTemplate.njk");
      });
    });
    describe("and the webTemplateAndPath is mapped", () => {
      it("should return the original webTemplateAndPath", () => {
        expect(getChannelSpecificTemplate("webTemplate.njk", false, mappings)).to.equal(
          "webTemplate.njk"
        );
      });
    });
  });

  describe("where the channel is an app", () => {
    describe("and the webTemplateAndPath is not mapped", () => {
      it("should return the original webTemplateAndPath", () => {
        expect(
          getChannelSpecificTemplate("notMappedTemplate.njk", true, mappings)
        ).to.equal("notMappedTemplate.njk");
      });
    });
    describe("and the webTemplateAndPath is mapped", () => {
      it("should return the original webTemplateAndPath", () => {
        expect(getChannelSpecificTemplate("webTemplate.njk", true, mappings)).to.equal(
          "mobileTemplate.njk"
        );
      });
    });
  });
});
