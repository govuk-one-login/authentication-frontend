import type { Page } from "playwright";
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

    // The Orchestration Stub main heading
    await this.page
      .getByRole("heading", { name: /orchestration stub/i })
      .waitFor({ state: "visible" });

    await this.assertBasicSecurity();
    await this.runAccessibilityCheck();
  }

  /**
   * Your stub page already loads with defaults selected.
   * This method exists for BDD readability and future expansion.
   */
  async selectDefaultOptions(): Promise<void> {
    return;
  }

  async submit(): Promise<void> {
    await this.page.getByRole("button", { name: /submit/i }).click();
  }
}
