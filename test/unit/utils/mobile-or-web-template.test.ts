import { expect } from "chai";
import { describe } from "mocha";
import { mobileOrWebTemplate } from "../../../src/utils/mobile-or-web-template";

describe("mobileOrWebTemplate", () => {
  const webTemplate = "sign-in-or-create/index.njk";

  describe("", () => {
    it("should return the original webTemplate when isMobileContext is false", () => {
      expect(mobileOrWebTemplate(webTemplate, false)).to.equal(webTemplate);
    });

    it("should not return the original webTemplate when isMobileContext is true", () => {
      expect(mobileOrWebTemplate(webTemplate, true)).to.not.equal(webTemplate);
    });

    it("should return the webTemplate filename with '-mobile-context.njk' suffix when isMobileContext is true", () => {
      const expectedTransforms: any = {
        "sign-in-or-create/index.njk":
          "sign-in-or-create/mobile-templates/index.njk",
        "account-creation/resend-mfa-code/index.njk":
          "account-creation/resend-mfa-code/mobile-templates/index.njk",
      };

      for (const property in expectedTransforms) {
        expect(mobileOrWebTemplate(property, true)).to.equal(
          expectedTransforms[property]
        );
      }
    });
  });
});
