import type { Page } from "playwright";
import { expect } from "../support/expect";
import { BasePage } from "./BasePage";

export class EnterAuthenticatorAppCodePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async assertLoaded(): Promise<void> {
    await expect(
      this.page.getByRole("heading", {
        name: /enter the 6 digit security code shown in your authenticator app/i,
      })
    ).toBeVisible();

    await this.assertBasicSecurity();
    await this.runAccessibilityCheck();
  }

  async enterCodeAndContinue(code: string): Promise<void> {
    await this.page.locator("#code").fill(code);
    await this.page.getByRole("button", { name: /continue/i }).click();
  }

  async assertInlineError(): Promise<void> {
    await expect(
      this.page
        .getByText(/the code you entered is not correct|enter the code/i)
        .first()
    ).toBeVisible();
  }
}
