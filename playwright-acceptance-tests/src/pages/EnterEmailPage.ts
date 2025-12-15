import type { Page } from "playwright";
import { BasePage } from "./BasePage";

export class EnterEmailPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async assertLoaded(): Promise<void> {
    // Based on your screenshot:
    // "Enter your email address to sign in to your GOV.UK One Login"
    await this.page
      .getByRole("heading", {
        name: /enter your email address to sign in to your gov\.uk one login/i,
      })
      .waitFor({ state: "visible" });

    await this.assertBasicSecurity();
    await this.runAccessibilityCheck();
  }

  async enterEmail(email: string): Promise<void> {
    await this.page.getByRole("textbox").fill(email);
  }

  async clickContinue(): Promise<void> {
    await this.page.getByRole("button", { name: /continue/i }).click();
  }
}
