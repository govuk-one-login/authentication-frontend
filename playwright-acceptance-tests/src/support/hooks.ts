import type { ITestCaseHookParameter } from "@cucumber/cucumber";
import { Before, After, Status } from "@cucumber/cucumber";
import type { PlaywrightWorld } from "./world";
import fs from "node:fs";
import path from "node:path";

const IMPOSTER_BASE_URL = process.env.IMPOSTER_URL || "http://api-stub:8080";
const STORE_NAMES = [
  "loginAttempts",
  "accountLocked",
  "verifyCodeAttempts",
  "mfaResendCount",
  "verifyMfaAttempts",
  "smsCodeLocked",
  "smsResendLocked",
  "authAppLocked",
];

Before(async function (this: PlaywrightWorld) {
  await resetImposterStores();
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

async function resetImposterStores(): Promise<void> {
  for (const storeName of STORE_NAMES) {
    try {
      await fetch(`${IMPOSTER_BASE_URL}/system/store/${storeName}`, {
        method: "DELETE",
      });
    } catch {
      // Imposter may not be reachable in local dev - ignore
    }
  }
}
