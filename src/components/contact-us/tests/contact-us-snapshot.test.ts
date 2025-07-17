import type { Page } from "@playwright/test";
import { test, expect } from "@playwright/test";
import { CONTACT_FORM_STRUCTURE } from "../../../app.constants.js";
import type { Theme } from "src/app.constants.js";

/*
TODO
- Trigger errors
- Test different languages
 */

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

test.describe.parallel("Snapshot:: contact us - public user", () => {
  const contactUsPath = "/contact-us";
  test(`should render ${contactUsPath}`, async ({ page }) => {
    await expectPageToMatchScreenshot(page, contactUsPath, "contact-us--en");
  });

  const contactUsSubmitSuccessPath = "/contact-us-submit-success";
  test(`should render ${contactUsSubmitSuccessPath}`, async ({ page }) => {
    await expectPageToMatchScreenshot(
      page,
      contactUsSubmitSuccessPath,
      "contact-us-submit-success--en"
    );
  });

  CONTACT_FORM_STRUCTURE.forEach((theme: Theme, themeKey: string) => {
    test.describe.parallel(themeKey, () => {
      if (theme.subThemes) {
        const subThemeFurtherInformationPath = `/contact-us-further-information?theme=${themeKey}`;
        test(`should render ${subThemeFurtherInformationPath}`, async ({
          page,
        }) => {
          await expectPageToMatchScreenshot(
            page,
            subThemeFurtherInformationPath,
            `contact-us-further-information--en--${themeKey}`
          );
        });

        theme.subThemes.forEach((_subTheme: Theme, subThemeKey) => {
          const subThemeQuestionsPath = `/contact-us-questions?theme=${themeKey}&subtheme=${subThemeKey}`;
          test(`should render ${subThemeQuestionsPath}`, async ({ page }) => {
            await expectPageToMatchScreenshot(
              page,
              subThemeQuestionsPath,
              `contact-us-questions--en--${themeKey}--${subThemeKey}`
            );
          });
        });
      } else {
        const themeQuestionsPath = `/contact-us-questions?theme=${themeKey}`;
        test(`should render ${themeQuestionsPath}`, async ({ page }) => {
          await expectPageToMatchScreenshot(
            page,
            themeQuestionsPath,
            `contact-us-questions--en--${themeKey}`
          );
        });
      }
    });
  });
});
