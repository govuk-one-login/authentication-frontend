import type { Page } from "playwright";
import { expect, expectHeading } from "../support/expect";
import { BasePage } from "./BasePage";

export class LockoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async assertHeading(heading: string): Promise<void> {
    await expectHeading(this.page, heading);
    await this.runAccessibilityCheck();
  }

  async assertDuration(duration: string): Promise<void> {
    await expect(this.page.getByText(duration).first()).toBeVisible();
  }

  async assertReason(reason: string): Promise<void> {
    await expect(this.page.getByText(reason).first()).toBeVisible();
  }
}
