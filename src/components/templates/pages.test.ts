import { expect } from "chai";
import { pages } from "./pages";
import { PATH_NAMES } from "../../app.constants";

// Pages that do not render a template
// Add paths here to exclude them from being checked on the template list
const NON_TEMPLATE_PATHS = [
  PATH_NAMES.AUTH_CODE,
  PATH_NAMES.AUTHORIZE,
  PATH_NAMES.CONTACT_US_FROM_TRIAGE_PAGE,
  PATH_NAMES.CONTACT_US_FURTHER_INFORMATION,
  PATH_NAMES.CONTACT_US_QUESTIONS,
  PATH_NAMES.CONTACT_US_SUBMIT_SUCCESS,
  PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT_REQUEST,
  PATH_NAMES.IPV_CALLBACK,
  PATH_NAMES.HEALTHCHECK,
  PATH_NAMES.MFA_RESET_WITH_IPV,
  PATH_NAMES.PROVE_IDENTITY_CALLBACK_STATUS,
  PATH_NAMES.RESET_PASSWORD_REQUEST,
  PATH_NAMES.ROOT,
  PATH_NAMES.UPLIFT_JOURNEY,
  PATH_NAMES.CANNOT_USE_EMAIL_ADDRESS_CONTINUE,
  PATH_NAMES.WELL_KNOWN_APPLE_ASSOCIATION,
  PATH_NAMES.SFAD_AUTHORIZE,
];

describe("template page listing", () => {
  it("should include all template paths", () => {
    const nonRedirectKeys = Object.values(PATH_NAMES).filter(
      (p) => !NON_TEMPLATE_PATHS.includes(p)
    );

    expect(pages).to.have.keys(nonRedirectKeys);
  });
});
