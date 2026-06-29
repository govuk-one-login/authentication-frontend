import type { Page } from "playwright";
import { BasePage } from "./BasePage";

export class StubStartPage extends BasePage {
  readonly pageHeading = /orchestration stub/i;

  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    const url = process.env.BASE_URL;
    if (!url) {
      throw new Error("BASE_URL is not set in your environment (.env file).");
    }

    await this.goto(url);

    await this.assertLoaded(this.pageHeading);
  }

  async selectDefaultOptions(): Promise<void> {
    return;
  }

  async submit(): Promise<void> {
    await this.page.getByRole("button", { name: /submit/i }).click();
  }
}
