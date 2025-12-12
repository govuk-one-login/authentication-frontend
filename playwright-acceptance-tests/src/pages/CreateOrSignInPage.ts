import type { Page } from "playwright";
import { BasePage } from "./BasePage";

export class CreateOrSignInPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async assertLoaded(): Promise<void> {
    await this.page
      .getByRole("heading", {
        name: /create your gov\.uk one login or sign in/i,
      })
      .waitFor({ state: "visible" });

    await this.assertBasicSecurity();
    await this.runAccessibilityCheck();
  }

  async clickCreateAccount(): Promise<void> {
    await this.page
      .getByRole("button", { name: /create your gov\.uk one login/i })
      .click();
  }

  async clickSignIn(): Promise<void> {
    await this.page.getByRole("button", { name: /^sign in$/i }).click();
  }
}
