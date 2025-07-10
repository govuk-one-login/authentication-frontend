import { describe } from "mocha";
import { request } from "../../../../../test/utils/test-utils.js";
import { PATH_NAMES } from "../../../../app.constants.js";
import { createApp } from "../../../../app.js";
import { expect } from "chai";

describe("Integration:: privacy notice link", () => {
  it("should render the privacy notice when the feature flag is disabled", async () => {
    process.env.PRIVACY_NOTICE_REDIRECT_ENABLED = "0";
    const app = await createApp();
    await request(app, (test) => test.get(PATH_NAMES.PRIVACY_POLICY), {
      expectAnalyticsPropertiesMatchSnapshot: false,
    })
      .expect(200)
      .then((res) => {
        expect(res.text).to.contain("GOV.UK One Login privacy notice");
      });
  });

  [PATH_NAMES.PRIVACY_POLICY, PATH_NAMES.PRIVACY_POLICY_NEW].forEach((path) => {
    it(`should redirect to the privacy notice when the feature flag is enabled for ${path}`, async () => {
      process.env.PRIVACY_NOTICE_REDIRECT_ENABLED = "1";
      const app = await createApp();
      await request(app, (test) => test.get(path), {
        expectAnalyticsPropertiesMatchSnapshot: false,
      })
        .expect(302)
        .then((res) => {
          expect(res.headers["location"]).to.equal(
            "https://www.gov.uk/government/publications/govuk-one-login-privacy-notice"
          );
        });
    });
  });

  [PATH_NAMES.PRIVACY_POLICY, PATH_NAMES.PRIVACY_POLICY_NEW].forEach((path) => {
    it(`should redirect to the welsh privacy notice when the lng cookie is cy for ${path}`, async () => {
      process.env.PRIVACY_NOTICE_REDIRECT_ENABLED = "1";
      const app = await createApp();
      await request(app, (test) => test.get(path).set("cookie", ["lng=cy"]), {
        expectAnalyticsPropertiesMatchSnapshot: false,
      })
        .expect(302)
        .then((res) => {
          expect(res.headers["location"]).to.equal(
            "https://www.gov.uk/government/publications/govuk-one-login-privacy-notice.cy"
          );
        });
    });
  });

  [PATH_NAMES.PRIVACY_POLICY, PATH_NAMES.PRIVACY_POLICY_NEW].forEach((path) => {
    it(`should redirect to the welsh privacy notice when the lng query param is cy for ${path}`, async () => {
      process.env.PRIVACY_NOTICE_REDIRECT_ENABLED = "1";
      const app = await createApp();
      await request(app, (test) => test.get(path + "?lng=cy"), {
        expectAnalyticsPropertiesMatchSnapshot: false,
      })
        .expect(302)
        .then((res) => {
          expect(res.headers["location"]).to.equal(
            "https://www.gov.uk/government/publications/govuk-one-login-privacy-notice.cy"
          );
        });
    });
  });
});
