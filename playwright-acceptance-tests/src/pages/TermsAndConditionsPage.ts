import { BasePage } from "./BasePage";

export class TermsAndConditionsPage extends BasePage {
  async agreeAndClickContinue(): Promise<void> {
    await this.clickContinue();
  }
}
