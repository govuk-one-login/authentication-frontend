import type { Page } from "playwright";
import { BasePage } from "./BasePage";

export class CheckYourEmailPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async enterCodeAndContinue(code: string): Promise<void> {
    await this.page.locator("#code").fill(code);
    await this.clickContinue();
  }
}
