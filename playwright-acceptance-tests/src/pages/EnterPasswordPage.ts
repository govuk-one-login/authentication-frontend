import type { Page } from "playwright";
import { expect } from "../support/expect";
import { BasePage } from "./BasePage";

export class EnterPasswordPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async assertLoaded(): Promise<void> {
    await expect(
      this.page.getByRole("heading", { name: /enter your password/i })
    ).toBeVisible();

    await this.assertBasicSecurity();
    await this.runAccessibilityCheck();
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
    await expect(
      this.page.getByText(/enter your password|incorrect password/i).first()
    ).toBeVisible();
  }
}
