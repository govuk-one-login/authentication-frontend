import { test } from "@playwright/test";
import { PATH_NAMES } from "../../src/app.constants.js";
import { expectPageToMatchScreenshot } from "./snapshot-helper.js";

test.describe("Snapshot:: cookie banner", () => {
  ["en", "cy"].forEach((lng) => {
    test.describe(lng, () => {
      test(`should render a page with the cookie banner`, async ({ page }) => {
        await expectPageToMatchScreenshot(
          page,
          `/templates${PATH_NAMES.CREATE_ACCOUNT_SUCCESSFUL}?lng=${lng}`,
          `cookie-banner--${lng}`
        );
      });
    });
  });
});
