import type { Page } from "@playwright/test";
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
  });
  expect(actualScreenshot).toMatchSnapshot(`${screenshotFileName}-.jpeg`, {
    threshold: 0.25,
    maxDiffPixels: 5,
  });
};
