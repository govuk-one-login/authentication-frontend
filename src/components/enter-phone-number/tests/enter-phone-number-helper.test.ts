import { expect } from "chai";
import { describe } from "mocha";
import { getPhoneNumberTemplateName } from "../enter-phone-number-helper";

const OLD_ENV = process.env;

describe("enter phone number helper", () => {
  beforeEach(() => {
    process.env = { ...OLD_ENV };
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  describe("getPhoneNumberTemplateName", () => {
    it("should return general template name when the SUPPORT_NEW_INTERNATIONAL_SMS feature flag is enabled", () => {
      process.env.SUPPORT_NEW_INTERNATIONAL_SMS = "1";
      const result = getPhoneNumberTemplateName();
      expect(result).to.equal("enter-phone-number/index.njk");
    });

    it("should return UK-only template name when the SUPPORT_NEW_INTERNATIONAL_SMS feature flag is disabled", () => {
      process.env.SUPPORT_NEW_INTERNATIONAL_SMS = "0";
      const result = getPhoneNumberTemplateName();
      expect(result).to.equal("enter-phone-number/index-uk-number-only.njk");
    });
  });
});
