import type { Page } from "playwright";
import { BasePage } from "./BasePage";

export class GetSecurityCodePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async assertLoaded(): Promise<void> {
    await this.page
      .getByRole("heading", { name: /get security code/i })
      .waitFor({ state: "visible" });
  }

  async clickGetSecurityCode(): Promise<void> {
    await this.page.getByRole("button", { name: /get security code/i }).click();
  }
}
