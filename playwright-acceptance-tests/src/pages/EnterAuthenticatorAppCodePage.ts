import type { Page } from "playwright";
import { BasePage } from "./BasePage";

export class EnterAuthenticatorAppCodePage extends BasePage {
  readonly pageHeading =
    /enter the 6 digit security code shown in your authenticator app/i;

  constructor(page: Page) {
    super(page);
  }

  async assertLoaded(): Promise<void> {
    await super.assertLoaded(this.pageHeading);
  }

  async enterCodeAndContinue(code: string): Promise<void> {
    await this.page.locator("#code").fill(code);
    await this.clickContinue();
  }

  async assertInlineError(): Promise<void> {
    await super.assertInlineError(
      /the code you entered is not correct|enter the code/i
    );
  }
}
