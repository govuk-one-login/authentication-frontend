import type { Page } from "playwright";
import { expect } from "../support/expect";
import { BasePage } from "./BasePage";

export class StubStartPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    const url = process.env.BASE_URL;
    if (!url) {
      throw new Error("BASE_URL is not set in your environment (.env file).");
    }

    await this.goto(url);

    await expect(
      this.page.getByRole("heading", { name: /orchestration stub/i })
    ).toBeVisible();

    await this.assertBasicSecurity();
    await this.runAccessibilityCheck();
  }

  async selectDefaultOptions(): Promise<void> {
    return;
  }

  async submit(): Promise<void> {
    await this.page.getByRole("button", { name: /submit/i }).click();
  }
}
