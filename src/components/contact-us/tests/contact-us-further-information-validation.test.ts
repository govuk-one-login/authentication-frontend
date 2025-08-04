import { expect } from "chai";
import { describe } from "mocha";
import { CONTACT_US_THEMES } from "../../../app.constants.js";
import { getErrorMessage } from "../validation/contact-us-further-information-validation.js";

describe("getErrorMessage", () => {
  it("should return the correct locale key for the given theme", () => {
    expect(getErrorMessage(CONTACT_US_THEMES.SIGNING_IN)).to.eq(
      "pages.contactUsFurtherInformation.signingIn.section1.errorMessage"
    );
    expect(getErrorMessage(CONTACT_US_THEMES.ACCOUNT_CREATION)).to.eq(
      "pages.contactUsFurtherInformation.accountCreation.section1.errorMessage"
    );
    expect(getErrorMessage(CONTACT_US_THEMES.ID_CHECK_APP)).to.eq(
      "pages.contactUsFurtherInformation.govUKLoginAndIdApps.section1.errorMessage"
    );
    expect(
      getErrorMessage(CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE)
    ).to.eq(
      "pages.contactUsFurtherInformation.provingIdentityFaceToFace.section1.errorMessage"
    );
    expect(getErrorMessage(CONTACT_US_THEMES.PROVING_IDENTITY)).to.eq(
      "pages.contactUsFurtherInformation.provingIdentity.section1.errorMessage"
    );
  });
});
