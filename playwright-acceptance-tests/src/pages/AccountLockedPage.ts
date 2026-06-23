import type { Page } from "playwright";
import { expect } from "../support/expect";
import { BasePage } from "./BasePage";

export class AccountLockedPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async assertHeadingVisible(heading: string): Promise<void> {
    await expect(
      this.page.getByRole("heading", { name: new RegExp(heading, "i") })
    ).toBeVisible();
    await this.runAccessibilityCheck();
  }

  async assertContainsText(text: string): Promise<void> {
    await expect(this.page.getByText(text).first()).toBeVisible();
  }
}
