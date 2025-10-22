import type { BrowserContext, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export const expectPageToMatchScreenshot = async (
  page: Page,
  pathToNavigateTo: string,
  screenshotFileName: string,
  fullPage = true
): Promise<void> => {
  await page.goto(pathToNavigateTo);
  const actualScreenshot = await page.screenshot({
    fullPage,
    type: "jpeg",
    quality: 20,
    animations: "disabled",
  });
  expect(actualScreenshot).toMatchSnapshot(`${screenshotFileName}-.jpeg`, {
    threshold: 0.25,
    maxDiffPixels: 5,
  });
};

export const dismissCookies = async (context: BrowserContext): Promise<void> =>
  context.addCookies([
    {
      name: "cookies_preferences_set",
      value: encodeURIComponent(JSON.stringify({ analytics: false })),
      domain: "localhost",
      path: "/",
    },
  ]);
