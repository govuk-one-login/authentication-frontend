import type { ITestCaseHookParameter } from "@cucumber/cucumber";
import { Before, After, Status } from "@cucumber/cucumber";
import type { PlaywrightWorld } from "./world";
import fs from "node:fs";
import path from "node:path";

Before(async function (this: PlaywrightWorld) {
  await this.openBrowser();
});

After(async function (this: PlaywrightWorld, scenario: ITestCaseHookParameter) {
  if (scenario.result?.status === Status.FAILED && this.page) {
    const safeName = scenario.pickle.name.replace(/[^a-z0-9\-]+/gi, "_");
    const screenshotsDir = path.join(process.cwd(), "reports", "screenshots");
    fs.mkdirSync(screenshotsDir, { recursive: true });

    const filePath = path.join(screenshotsDir, `${safeName}.png`);
    await this.page.screenshot({ path: filePath, fullPage: true });

    const image = fs.readFileSync(filePath);
    this.attach(image, "image/png");
  }

  await this.closeBrowser();
});
