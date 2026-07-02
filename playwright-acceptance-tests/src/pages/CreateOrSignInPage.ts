import type { Page } from "playwright";
import { BasePage } from "./BasePage";

export class CreateOrSignInPage extends BasePage {
  readonly pageHeading = /create your gov\.uk one login or sign in/i;

  constructor(page: Page) {
    super(page);
  }

  async assertLoaded(): Promise<void> {
    await super.assertLoaded(this.pageHeading);
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
