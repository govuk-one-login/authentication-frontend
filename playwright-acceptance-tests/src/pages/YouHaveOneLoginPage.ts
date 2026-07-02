import type { Page } from "playwright";
import { BasePage } from "./BasePage";

export class YouHaveOneLoginPage extends BasePage {
  readonly pageHeading = /you have a gov\.uk one login/i;

  constructor(page: Page) {
    super(page);
  }

  async assertLoaded(): Promise<void> {
    await super.assertLoaded(this.pageHeading);
  }
}
