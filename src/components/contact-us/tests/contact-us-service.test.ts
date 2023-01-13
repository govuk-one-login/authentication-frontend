import { expect } from "chai";
import { describe } from "mocha";
import { ZENDESK_THEMES } from "../../../app.constants";
import { getZendeskIdentifierTag } from "../contact-us-service";

describe("contact-us-service", () => {
  describe("getZendeskIdentifierTag", () => {
    it("should return 'sign_in_app' when passed the ID_CHECK_APP theme", () => {
      expect(getZendeskIdentifierTag(ZENDESK_THEMES.ID_CHECK_APP)).to.equal(
        "sign_in_app"
      );
    });
    for (const theme in ZENDESK_THEMES) {
      it(`should return 'govuk_sign_in' when passed ${theme}`, () => {
        if (theme !== ZENDESK_THEMES.ID_CHECK_APP) {
          expect(getZendeskIdentifierTag(theme)).to.equal("govuk_sign_in");
        }
      });
    }
  });
});
