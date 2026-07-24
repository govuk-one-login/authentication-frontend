import { Given, When } from "@cucumber/cucumber";
import type { PlaywrightWorld } from "../support/world";
import { BasePage } from "../pages/BasePage";
import { requirePage } from "../support/utils";
import { TermsAndConditionsPage } from "../pages/TermsAndConditionsPage";

When(
  "the user clicks the Back link",
  async function (this: PlaywrightWorld): Promise<void> {
    await new BasePage(requirePage(this)).clickBack();
  }
);

When(
  "the user selects radio button {string}",
  async function (this: PlaywrightWorld, label: string): Promise<void> {
    const page = new BasePage(requirePage(this));
    await page.selectRadioButton(label);
    await page.clickContinue();
  }
);

Given(
  "the browser supports passkeys",
  async function (this: PlaywrightWorld): Promise<void> {
    await requirePage(this)
      .locator("#browserSupportsWebAuthn")
      .evaluate((el: HTMLInputElement) => (el.value = "true"));
  }
);

Given(
  "the user has not yet accepted the latest terms and conditions",
  async function () {
    const stubUrl = process.env.API_STUB_URL || "http://api-stub:8080";
    await fetch(`${stubUrl}/test/state/terms-and-conditions-not-accepted`, {
      method: "PUT",
    });
  }
);

When(
  "the user agrees to the updated terms and conditions",
  async function (this: PlaywrightWorld): Promise<void> {
    const page = new TermsAndConditionsPage(requirePage(this));
    await page.agreeAndClickContinue();
  }
);
