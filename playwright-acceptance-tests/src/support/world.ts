import type { IWorldOptions } from "@cucumber/cucumber";
import {
  World,
  setWorldConstructor,
  setDefaultTimeout,
} from "@cucumber/cucumber";
import type { Browser, BrowserContext, Page, BrowserType } from "playwright";
import { chromium, firefox, webkit } from "playwright";

export class PlaywrightWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;

  constructor(options: IWorldOptions) {
    super(options);
  }

  async openBrowser(): Promise<void> {
    const browserName = (process.env.BROWSER || "chromium").toLowerCase();
    const headless = (process.env.HEADLESS || "true").toLowerCase() === "true";

    const browserType = setBrowserType(browserName);

    this.browser = await browserType.launch({ headless });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
  }

  async closeBrowser(): Promise<void> {
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
  }
}

setWorldConstructor(PlaywrightWorld);
setDefaultTimeout(30 * 1000);

function setBrowserType(browserName: string): BrowserType {
  switch (browserName) {
    case "firefox":
      return firefox;
    case "webkit":
      return webkit;
    default:
      return chromium;
  }
}
