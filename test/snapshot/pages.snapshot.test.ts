import { test } from "@playwright/test";
import querystring from "querystring";
import { pages } from "../../src/components/templates/pages.js";
import { PATH_NAMES } from "../../src/app.constants.js";
import {
  dismissCookies,
  expectPageToMatchScreenshot,
} from "./snapshot-helper.js";

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

test.beforeEach(async ({ context }) => {
  await dismissCookies(context);
});

test.describe("Snapshot:: all pages", () => {
  ["en", "cy"].forEach((lng) => {
    test.describe(lng, () => {
      Object.entries(pages)
        .filter(([authPage]) => !EXCLUDED_PATHS.includes(authPage))
        .forEach(([authPage, variants]) => {
          const pageName = authPage.replace(/^\//, "");
          if (Array.isArray(variants)) {
            variants.forEach((variant) => {
              test(`should render ${authPage} (${variant.name})`, async ({
                context,
                page,
              }) => {
                await dismissCookies(context);
                const query = querystring.stringify({
                  lng,
                  pageVariant: variant.name,
                });
                await expectPageToMatchScreenshot(
                  page,
                  `/templates${authPage}?${query}`,
                  `${pageName}--${variant.name}--${lng}`,
                  !TRUNCATED_SCREENSHOT_PATHS.includes(authPage)
                );
              });
            });
          } else {
            test(`should render ${authPage}`, async ({ context, page }) => {
              await dismissCookies(context);
              await expectPageToMatchScreenshot(
                page,
                `/templates${authPage}?lng=${lng}`,
                `${pageName}--default--${lng}`,
                !TRUNCATED_SCREENSHOT_PATHS.includes(authPage)
              );
            });
          }
        });
    });
  });
});
