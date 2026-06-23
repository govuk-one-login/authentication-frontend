import type { Page } from "playwright";
import { BasePage } from "./BasePage";
import assert from "node:assert";

export class StubUserInfoPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async assertReturned(): Promise<void> {
    await this.page.waitForFunction(
      () => document.body.textContent?.includes("Session ID"),
      null,
      { timeout: 10000 }
    );
    const text = await this.page.locator("body").textContent();
    assert(text?.includes("Session ID"), "Expected to be returned to service");
  }
}
