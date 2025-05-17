import { expect } from "chai";
import { describe } from "mocha";
import { getChannelSpecificTemplate } from "../../../src/utils/get-channel-specific-template.js";
import type { MobileAndStrategicAppRoutes } from "../../../src/app.constants.js";
const mappings: Record<string, MobileAndStrategicAppRoutes> = {
  "webTemplate.njk": {
    strategicApp: "strategicAppTemplate.njk",
    mobile: "mobileTemplate.njk",
  },
};

describe("getChannelSpecificTemplate", () => {
  describe("where the channel is not mobile", () => {
    describe("and the webTemplateAndPath is not mapped", () => {
      it("should return the original webTemplateAndPath", () => {
        expect(
          getChannelSpecificTemplate(
            "notMappedTemplate.njk",
            false,
            false,
            mappings
          )
        ).to.equal("notMappedTemplate.njk");
      });
    });
    describe("and the webTemplateAndPath is mapped", () => {
      it("should return the original webTemplateAndPath", () => {
        expect(
          getChannelSpecificTemplate("webTemplate.njk", false, false, mappings)
        ).to.equal("webTemplate.njk");
      });
    });
  });

  describe("where the channel is strategic-app", () => {
    describe("and the webTemplateAndPath is not mapped", () => {
      it("should return the original webTemplateAndPath", () => {
        expect(
          getChannelSpecificTemplate(
            "notMappedTemplate.njk",
            true,
            false,
            mappings
          )
        ).to.equal("notMappedTemplate.njk");
      });
    });
    describe("and the webTemplateAndPath is mapped", () => {
      it("should return the original webTemplateAndPath", () => {
        expect(
          getChannelSpecificTemplate("webTemplate.njk", true, false, mappings)
        ).to.equal("strategicAppTemplate.njk");
      });
    });
  });

  describe("where the channel is mobile", () => {
    describe("and the webTemplateAndPath is not mapped", () => {
      it("should return the original webTemplateAndPath", () => {
        expect(
          getChannelSpecificTemplate(
            "notMappedTemplate.njk",
            false,
            true,
            mappings
          )
        ).to.equal("notMappedTemplate.njk");
      });
    });
    describe("and the webTemplateAndPath is mapped", () => {
      it("should return the original webTemplateAndPath", () => {
        expect(
          getChannelSpecificTemplate("webTemplate.njk", true, false, mappings)
        ).to.equal("mobileTemplate.njk");
      });
    });
  });
});
