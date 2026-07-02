import type { Page } from "playwright";
import { BasePage } from "./BasePage";

export class CheckYourPhonePage extends BasePage {
  readonly pageHeading = /check your phone/i;

  constructor(page: Page) {
    super(page);
  }

  async assertLoaded(): Promise<void> {
    await super.assertLoaded(this.pageHeading);
  }

  async enterSecurityCode(code: string): Promise<void> {
    await this.page.locator("#code").fill(code);
  }

  async enterCodeAndContinue(code: string): Promise<void> {
    await this.enterSecurityCode(code);
    await this.clickContinue();
  }

  async assertInlineError(): Promise<void> {
    await super.assertInlineError(
      /the code you entered is not correct|enter the code/i
    );
  }
}
