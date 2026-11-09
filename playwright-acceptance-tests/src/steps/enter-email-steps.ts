import { When } from "@cucumber/cucumber";
import type { PlaywrightWorld } from "../support/world";
import { requirePage } from "../support/utils";
import { stub } from "../support/stub";
import { EnterEmailPage } from "../pages/EnterEmailPage";
import { EMAIL } from "../support/constants";
import { existingAccountUserExistsResponse } from "../responses/user-exists";

When(
  "the user enters an email address of an existing account",
  async function (this: PlaywrightWorld): Promise<void> {
    await stub.setUserExistsResponse(existingAccountUserExistsResponse);
    const page = new EnterEmailPage(requirePage(this));
    await page.enterEmail(EMAIL);
    await page.clickContinue();
  }
);

When(
  "the user enters an email address of an existing account in Welsh",
  async function (this: PlaywrightWorld): Promise<void> {
    await stub.setUserExistsResponse(existingAccountUserExistsResponse);
    const page = requirePage(this);
    await page.getByRole("textbox").fill(EMAIL);
    await page.getByRole("button", { name: /parhau/i }).click();
  }
);
