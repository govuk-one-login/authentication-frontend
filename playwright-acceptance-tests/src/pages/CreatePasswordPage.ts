import type { Page } from "playwright";
import { BasePage } from "./BasePage";

export class CreatePasswordPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async createPasswordAndContinue(password: string): Promise<void> {
    await this.page.locator("#password").fill(password);
    await this.page.locator("#confirm-password").fill(password);
    await this.clickContinue();
  }
}
