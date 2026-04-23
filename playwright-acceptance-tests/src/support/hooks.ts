import type { ITestCaseHookParameter } from "@cucumber/cucumber";
import { Before, After, Status } from "@cucumber/cucumber";
import type { PlaywrightWorld } from "./world";
import fs from "node:fs";
import path from "node:path";

Before(async function (this: PlaywrightWorld) {
  await this.createContext();

  if (this.context) {
    await this.context.tracing.start({ screenshots: true, snapshots: true });
  }

  // Reset Imposter stores to prevent state leaking between scenarios
  const imposterUrl = process.env.IMPOSTER_URL || "http://api-stub:8080";
  const storeNames = [
    "loginAttempts",
    "lockedOutPassword",
    "lockedOutMfa",
    "mfaResendCount",
    "verifyMfaAttempts",
    "verifyCodeAttempts",
    "authenticated",
  ];
  try {
    await Promise.all(
      storeNames.map((s) =>
        fetch(`${imposterUrl}/system/store/${s}`, { method: "DELETE" })
      )
    );
  } catch {
    // Imposter may not be reachable in non-docker environments
  }
});

After(async function (this: PlaywrightWorld, scenario: ITestCaseHookParameter) {
  const safeName = scenario.pickle.name.replace(/[^a-z0-9\-]+/gi, "_");

  if (scenario.result?.status === Status.FAILED) {
    const reportsDir = path.join(process.cwd(), "reports");

    if (this.page) {
      const screenshotsDir = path.join(reportsDir, "screenshots");
      fs.mkdirSync(screenshotsDir, { recursive: true });
      const screenshotPath = path.join(screenshotsDir, `${safeName}.png`);
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      this.attach(fs.readFileSync(screenshotPath), "image/png");
    }

    if (this.context) {
      const tracesDir = path.join(reportsDir, "traces");
      fs.mkdirSync(tracesDir, { recursive: true });
      const tracePath = path.join(tracesDir, `${safeName}.zip`);
      await this.context.tracing.stop({ path: tracePath });
    }
  } else if (this.context) {
    await this.context.tracing.stop();
  }

  await this.closeContext();
});
