import { BasePage } from "./BasePage";

export class TermsAndConditionsPage extends BasePage {
  async agreeAndClickContinue(): Promise<void> {
    const acceptAndContinueButton = this.page.locator(
      '[name="termsAndConditionsResult"]'
    );
    await acceptAndContinueButton.click();
  }
}
