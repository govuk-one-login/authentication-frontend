import type { Page } from "playwright";
import { BasePage } from "./BasePage";

export class EnterPasswordPage extends BasePage {
  readonly pageHeading = /enter your password/i;

  constructor(page: Page) {
    super(page);
  }

  async assertLoaded(): Promise<void> {
    await super.assertLoaded(this.pageHeading);
  }

  async enterPassword(password: string): Promise<void> {
    await this.page.locator("#password").fill(password);
  }

  async clickContinue(): Promise<void> {
    await this.page.getByRole("button", { name: /continue/i }).click();
  }

  async enterPasswordAndContinue(password: string): Promise<void> {
    await this.enterPassword(password);
    await this.clickContinue();
  }

  async assertInlineError(): Promise<void> {
    await super.assertInlineError(/enter your password|incorrect password/i);
  }
}
