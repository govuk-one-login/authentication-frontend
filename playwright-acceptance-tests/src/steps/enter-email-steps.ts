import { When } from "@cucumber/cucumber";
import type { PlaywrightWorld } from "../support/world";
import { requirePage } from "../support/utils";
import { stub } from "../support/stub";
import { EnterEmailPage } from "../pages/EnterEmailPage";
import { TEST_EMAIL } from "../support/constants";
import { existingAccountUserExistsResponse } from "../responses/user-exists";

When(
  "the user enters an email address of an existing account",
  async function (this: PlaywrightWorld): Promise<void> {
    await stub.setUserExistsResponse(existingAccountUserExistsResponse);
    const page = new EnterEmailPage(requirePage(this));
    await page.enterEmail(TEST_EMAIL.SMS_USER);
    await page.clickContinue();
  }
);
