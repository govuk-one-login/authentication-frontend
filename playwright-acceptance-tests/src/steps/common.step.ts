import { Given, When, Then } from "@cucumber/cucumber";
import type { PlaywrightWorld } from "../support/world";
import { BasePage } from "../pages/BasePage";
import { requirePage } from "../support/utils";
import { expect } from "../support/expect";
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

When(
  "the user agrees to the updated terms and conditions",
  async function (this: PlaywrightWorld): Promise<void> {
    const page = new TermsAndConditionsPage(requirePage(this));
    await page.agreeAndClickContinue();
  }
);

When(
  "the user clicks link {string}",
  async function (this: PlaywrightWorld, linkText: string): Promise<void> {
    await requirePage(this).getByRole("link", { name: linkText }).click();
  }
);

When(
  "the user clicks details with text {string}",
  async function (this: PlaywrightWorld, detailsText): Promise<void> {
    await requirePage(this)
      .locator(".govuk-details__summary")
      .filter({ hasText: detailsText })
      .click();
  }
);

Then(
  "an error summary is shown containing {string}",
  async function (this: PlaywrightWorld, expectedText: string): Promise<void> {
    const errorSummary = requirePage(this).locator(".govuk-error-summary");
    await expect(errorSummary).toBeVisible();
    await expect(errorSummary).toContainText(expectedText);
  }
);
