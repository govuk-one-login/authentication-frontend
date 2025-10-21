import { test } from "@playwright/test";
import querystring from "querystring";
import { pages } from "./pages.js";
import { PATH_NAMES } from "../../app.constants.js";
import { expectPageToMatchScreenshot } from "../../../test/helpers/screenshot-helper.js";

// Contact form is covered by contact-us-snapshot.test.ts
const EXCLUDED_PATHS = [PATH_NAMES.CONTACT_US];

// These pages are very large and full screenshots take up a lot of space
const TRUNCATED_SCREENSHOT_PATHS = [
  PATH_NAMES.ACCESSIBILITY_STATEMENT,
  PATH_NAMES.COOKIES_POLICY,
  PATH_NAMES.PRIVACY_POLICY,
  PATH_NAMES.PRIVACY_POLICY_NEW,
  PATH_NAMES.TERMS_AND_CONDITIONS,
];

test.describe("Snapshot:: all pages", () => {
  ["en", "cy"].forEach((lng) => {
    test.describe(lng, () => {
      Object.entries(pages)
        .filter(([authPage]) => !EXCLUDED_PATHS.includes(authPage))
        .forEach(([authPage, variants]) => {
          if (Array.isArray(variants)) {
            variants.forEach((variant) => {
              test(`should render ${authPage} (${variant.name})`, async ({
                page,
              }) => {
                const query = querystring.stringify({
                  lng,
                  pageVariant: variant.name,
                });
                await expectPageToMatchScreenshot(
                  page,
                  `/templates${authPage}?${query}`,
                  `${authPage}--${variant.name}--${lng}`,
                  !TRUNCATED_SCREENSHOT_PATHS.includes(authPage)
                );
              });
            });
          } else {
            test(`should render ${authPage}`, async ({ page }) => {
              await expectPageToMatchScreenshot(
                page,
                `/templates${authPage}?lng=${lng}`,
                `${authPage}--default--${lng}`,
                !TRUNCATED_SCREENSHOT_PATHS.includes(authPage)
              );
            });
          }
        });
    });
  });
});
