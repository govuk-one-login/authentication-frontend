import type { Page } from "playwright";
import { BasePage } from "./BasePage";

/**
 * The "Get security code" resend page. Its heading is shared by every resend
 * route (/resend-code, /reset-password-resend-code-2fa-sms and
 * /resend-code-create-account); scenarios assert the specific URL path
 * separately to confirm the journey-specific page.
 */
export class ResendSecurityCodePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async requestNewCode(): Promise<void> {
    await this.page.getByRole("button", { name: /get security code/i }).click();
  }
}
