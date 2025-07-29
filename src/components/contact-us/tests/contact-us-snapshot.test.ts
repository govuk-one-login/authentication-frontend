import type { Page } from "@playwright/test";
import { test, expect } from "@playwright/test";
import { CONTACT_FORM_STRUCTURE } from "../structure/contact-us-structure.js";
import type { Theme } from "../structure/contact-us-structure.js";

const expectPageToMatchScreenshot = async (
  page: Page,
  pathToNavigateTo: string,
  screenshotFileName: string
) => {
  await page.goto(pathToNavigateTo);
  const actualScreenshot = await page.screenshot({
    fullPage: true,
    type: "jpeg",
    quality: 20,
  });
  expect(actualScreenshot).toMatchSnapshot(`${screenshotFileName}-.jpeg`, {
    threshold: 0.25,
  });
};

test.describe("Snapshot:: contact us - public user", () => {
  ["en", "cy"].forEach((lng: string) => {
    test.describe(lng, () => {
      const contactUsPath = `/contact-us?lng=${lng}`;
      test(`should render ${contactUsPath}`, async ({ page }) => {
        await expectPageToMatchScreenshot(
          page,
          contactUsPath,
          `contact-us--${lng}`
        );
      });

      const contactUsGovServicePath = `/contact-us?supportType=GOV_SERVICE&lng=${lng}`;
      test(`should render ${contactUsGovServicePath}`, async ({ page }) => {
        await expectPageToMatchScreenshot(
          page,
          contactUsGovServicePath,
          `contact-us--GOV_SERVICE--${lng}`
        );
      });

      const contactUsSubmitSuccessPath = `/contact-us-submit-success?lng=${lng}`;
      test(`should render ${contactUsSubmitSuccessPath}`, async ({ page }) => {
        await expectPageToMatchScreenshot(
          page,
          contactUsSubmitSuccessPath,
          `contact-us-submit-success--${lng}`
        );
      });

      CONTACT_FORM_STRUCTURE.forEach((theme: Theme, themeKey: string) => {
        test.describe.parallel(themeKey, () => {
          if (theme.subThemes) {
            const subThemeFurtherInformationPath = `/contact-us-further-information?theme=${themeKey}&lng=${lng}`;
            test(`should render ${subThemeFurtherInformationPath}`, async ({
              page,
            }) => {
              await expectPageToMatchScreenshot(
                page,
                subThemeFurtherInformationPath,
                `contact-us-further-information--${themeKey}--${lng}`
              );
            });

            theme.subThemes.forEach((_subTheme: Theme, subThemeKey) => {
              const subThemeQuestionsPath = `/contact-us-questions?theme=${themeKey}&subtheme=${subThemeKey}&lng=${lng}`;
              test(`should render ${subThemeQuestionsPath}`, async ({
                page,
              }) => {
                await expectPageToMatchScreenshot(
                  page,
                  subThemeQuestionsPath,
                  `contact-us-questions--${themeKey}--${subThemeKey}--${lng}`
                );
              });
            });
          } else {
            const themeQuestionsPath = `/contact-us-questions?theme=${themeKey}&lng=${lng}`;
            test(`should render ${themeQuestionsPath}`, async ({ page }) => {
              await expectPageToMatchScreenshot(
                page,
                themeQuestionsPath,
                `contact-us-questions--${themeKey}--${lng}`
              );
            });
          }
        });
      });
    });
  });
});
