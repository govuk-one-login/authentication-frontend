import type { IWorldOptions } from "@cucumber/cucumber";
import {
  World,
  setWorldConstructor,
  setDefaultTimeout,
} from "@cucumber/cucumber";
import type { Browser, BrowserContext, Page, BrowserType } from "playwright";
import { chromium, firefox, webkit } from "playwright";

let sharedBrowser: Browser | undefined;

async function getBrowser(): Promise<Browser> {
  if (!sharedBrowser) {
    const browserName = (process.env.BROWSER || "chromium").toLowerCase();
    const headless = (process.env.HEADLESS || "true").toLowerCase() === "true";
    const browserType: BrowserType =
      browserName === "firefox"
        ? firefox
        : browserName === "webkit"
          ? webkit
          : chromium;
    sharedBrowser = await browserType.launch({ headless });
  }
  return sharedBrowser;
}

export class PlaywrightWorld extends World {
  context?: BrowserContext;
  page?: Page;

  constructor(options: IWorldOptions) {
    super(options);
  }

  async createContext(): Promise<void> {
    const browser = await getBrowser();
    this.context = await browser.newContext();
    this.page = await this.context.newPage();
  }

  async closeContext(): Promise<void> {
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
  }
}

setWorldConstructor(PlaywrightWorld);
setDefaultTimeout(30 * 1000);
