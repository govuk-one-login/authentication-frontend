import type { Page } from "playwright";
import { expect } from "../support/expect";
import { BasePage } from "./BasePage";

export class CheckYourPhonePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async assertLoaded(): Promise<void> {
    await expect(
      this.page.getByRole("heading", { name: /check your phone/i })
    ).toBeVisible();

    await this.assertBasicSecurity();
    await this.runAccessibilityCheck();
  }

  async enterSecurityCode(code: string): Promise<void> {
    await this.page.locator("#code").fill(code);
  }

  async clickContinue(): Promise<void> {
    await this.page.getByRole("button", { name: /continue/i }).click();
  }

  async enterCodeAndContinue(code: string): Promise<void> {
    await this.enterSecurityCode(code);
    await this.clickContinue();
  }

  async assertInlineError(): Promise<void> {
    await expect(
      this.page
        .getByText(/the code you entered is not correct|enter the code/i)
        .first()
    ).toBeVisible();
  }
}
