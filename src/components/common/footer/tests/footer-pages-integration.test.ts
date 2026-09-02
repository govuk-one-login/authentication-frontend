import { describe } from "mocha";
import { PATH_NAMES } from "../../../../app.constants.js";
import { createApp } from "../../../../app.js";
import { expect } from "chai";
import request from "supertest";

describe("Integration:: privacy notice link", () => {
  [PATH_NAMES.PRIVACY_POLICY, PATH_NAMES.PRIVACY_POLICY_NEW].forEach((path) => {
    it(`should redirect to the privacy notice for ${path}`, async () => {
      const app = await createApp();
      await request(app)
        .get(path)
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
      const app = await createApp();
      await request(app)
        .get(path)
        .set("Cookie", ["lng=cy"])
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
      const app = await createApp();
      await request(app)
        .get(path + "?lng=cy")
        .expect(302)
        .then((res) => {
          expect(res.headers["location"]).to.equal(
            "https://www.gov.uk/government/publications/govuk-one-login-privacy-notice.cy"
          );
        });
    });
  });
});

describe("Integration:: accessibility statement link", () => {
  it("should redirect to the accessibility statement", async () => {
    const app = await createApp();
    await request(app)
      .get(PATH_NAMES.ACCESSIBILITY_STATEMENT)
      .expect(302)
      .then((res) => {
        expect(res.headers["location"]).to.equal(
          "https://www.gov.uk/guidance/govuk-one-login-accessibility-statement"
        );
      });
  });

  it("should redirect to the welsh accessibility statement when the lng cookie is cy", async () => {
    const app = await createApp();
    await request(app)
      .get(PATH_NAMES.ACCESSIBILITY_STATEMENT)
      .set("Cookie", ["lng=cy"])
      .expect(302)
      .then((res) => {
        expect(res.headers["location"]).to.equal(
          "https://www.gov.uk/guidance/govuk-one-login-accessibility-statement.cy"
        );
      });
  });

  it("should redirect to the welsh accessibility statement when the lng query param is cy", async () => {
    const app = await createApp();
    await request(app)
      .get(PATH_NAMES.ACCESSIBILITY_STATEMENT + "?lng=cy")
      .expect(302)
      .then((res) => {
        expect(res.headers["location"]).to.equal(
          "https://www.gov.uk/guidance/govuk-one-login-accessibility-statement.cy"
        );
      });
  });
});
