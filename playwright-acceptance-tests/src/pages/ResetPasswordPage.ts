import type { Page } from "playwright";
import { BasePage } from "./BasePage";

export class ResetPasswordPage extends BasePage {
  readonly pageHeading = /reset your password/i;

  constructor(page: Page) {
    super(page);
  }

  async assertLoaded(): Promise<void> {
    await super.assertLoaded(this.pageHeading);
  }

  async resetPasswordAndContinue(password: string): Promise<void> {
    await this.page.locator("#password").fill(password);
    await this.page.locator("#confirm-password").fill(password);
    await this.clickContinue();
  }
}
