import type { Page } from "playwright";
import { expect } from "../support/expect";
import { BasePage } from "./BasePage";

export class YouHaveOneLoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async assertLoaded(): Promise<void> {
    await expect(
      this.page.getByRole("heading", { name: /you have a gov\.uk one login/i })
    ).toBeVisible();

    await this.assertBasicSecurity();
    await this.runAccessibilityCheck();
  }
}
