import type { IWorldOptions } from "@cucumber/cucumber";
import {
  World,
  setWorldConstructor,
  setDefaultTimeout,
} from "@cucumber/cucumber";
import type { Browser, BrowserContext, Page } from "playwright";
import { chromium, firefox, webkit } from "playwright";
import "./env"; // ensure .env is loaded before we read process.env

export class PlaywrightWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;

  constructor(options: IWorldOptions) {
    super(options);
  }

  async openBrowser() {
    const browserName = (process.env.BROWSER || "chromium").toLowerCase();
    const headless = (process.env.HEADLESS || "true").toLowerCase() === "true";

    const browserType =
      browserName === "firefox"
        ? firefox
        : browserName === "webkit"
          ? webkit
          : chromium;

    this.browser = await browserType.launch({ headless });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
  }

  async closeBrowser() {
    await this.page?.close();
    await this.context?.close();
    await this.browser?.close();
  }
}

setWorldConstructor(PlaywrightWorld);
setDefaultTimeout(30 * 1000);
