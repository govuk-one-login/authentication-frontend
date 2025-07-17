import { test, expect } from "@playwright/test";
import { CONTACT_FORM_STRUCTURE } from "../../../app.constants.js";
import type { Theme } from "src/app.constants.js";

/*
TODO
- Extract stuff below to make reusable
- Trigger errors
- Test different languages
 */

test.describe.parallel("Snapshot:: contact us - public user", () => {
  const contactUsPath = "/contact-us";
  test(`should render ${contactUsPath}`, async ({ page }) => {
    await page.goto(contactUsPath);
    const actualScreenshot = await page.screenshot({
      fullPage: true,
      type: "jpeg",
      quality: 20,
    });
    expect(actualScreenshot).toMatchSnapshot(`contact-us--en.jpeg`, {
      threshold: 0.25,
    });
  });

  CONTACT_FORM_STRUCTURE.forEach((theme: Theme, themeKey: string) => {
    test.describe.parallel(themeKey, () => {
      if (theme.subThemes) {
        const subThemeFurtherInformationPath = `/contact-us-further-information?theme=${themeKey}`;
        test(`should render ${subThemeFurtherInformationPath}`, async ({
          page,
        }) => {
          await page.goto(subThemeFurtherInformationPath);
          const actualScreenshot = await page.screenshot({
            fullPage: true,
            type: "jpeg",
            quality: 20,
          });
          expect(actualScreenshot).toMatchSnapshot(
            `contact-us-further-information--en--${themeKey}.jpeg`,
            { threshold: 0.25 }
          );
        });

        theme.subThemes.forEach((_subTheme: Theme, subThemeKey) => {
          const subThemeQuestionsPath = `/contact-us-questions?theme=${themeKey}&subtheme=${subThemeKey}`;
          test(`should render ${subThemeQuestionsPath}`, async ({ page }) => {
            await page.goto(subThemeQuestionsPath);
            const actualScreenshot = await page.screenshot({
              fullPage: true,
              type: "jpeg",
              quality: 20,
            });
            expect(actualScreenshot).toMatchSnapshot(
              `contact-us-questions--en--${themeKey}--${subThemeKey}.jpeg`,
              { threshold: 0.25 }
            );
          });
        });
      } else {
        const themeQuestionsPath = `/contact-us-questions?theme=${themeKey}`;
        test(`should render ${themeQuestionsPath}`, async ({ page }) => {
          await page.goto(themeQuestionsPath);
          const actualScreenshot = await page.screenshot({
            fullPage: true,
            type: "jpeg",
            quality: 20,
          });
          expect(actualScreenshot).toMatchSnapshot(
            `contact-us-questions--en--${themeKey}.jpeg`,
            { threshold: 0.25 }
          );
        });
      }
    });
  });
});
