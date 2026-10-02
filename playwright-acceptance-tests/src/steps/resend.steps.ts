import { When, Then } from "@cucumber/cucumber";
import type { PlaywrightWorld } from "../support/world";
import { requirePage } from "../support/utils";
import { expect } from "../support/expect";
import { ResendSecurityCodePage } from "../pages/ResendSecurityCodePage";

/**
 * The resend link lives inside a "Problems with the code?" details expander on
 * every code-entry page, so it must be expanded before the link is clickable.
 * The link text ("send the code again") is shared across all journeys.
 */
When(
  "the user chooses to resend the security code",
  async function (this: PlaywrightWorld): Promise<void> {
    const page = requirePage(this);
    await page.getByText(/problems with the code/i).click();
    await page.getByRole("link", { name: /send the code again/i }).click();
  }
);

When(
  "the user requests a new security code",
  async function (this: PlaywrightWorld): Promise<void> {
    await new ResendSecurityCodePage(requirePage(this)).requestNewCode();
  }
);

Then(
  "the current page path is {string}",
  async function (this: PlaywrightWorld, expectedPath: string): Promise<void> {
    const actualPath = new URL(requirePage(this).url()).pathname;
    expect(actualPath).toBe(expectedPath);
  }
);
