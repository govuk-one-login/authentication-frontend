import type { Page } from "playwright";
import { BasePage } from "./BasePage";

export class EnterEmailPage extends BasePage {
  readonly pageHeading =
    /enter your email address to sign in to your gov\.uk one login/i;

  constructor(page: Page) {
    super(page);
  }

  async assertLoaded(): Promise<void> {
    await super.assertLoaded(this.pageHeading);
  }

  async enterEmail(email: string): Promise<void> {
    await this.page.getByRole("textbox").fill(email);
  }

  async clickContinue(): Promise<void> {
    await super.clickContinue();
  }
}
