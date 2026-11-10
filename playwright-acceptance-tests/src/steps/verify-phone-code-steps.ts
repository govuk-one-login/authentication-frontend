import { When } from "@cucumber/cucumber";
import type { PlaywrightWorld } from "../support/world";
import { requirePage } from "../support/utils";
import { stub } from "../support/stub";
import { CheckYourPhonePage } from "../pages/CheckYourPhonePage";
import { correctMfaCodeResponse } from "../responses/verify-mfa-code";

When(
  "the user enters the correct six digit security code from their phone",
  async function (this: PlaywrightWorld): Promise<void> {
    await stub.setVerifyMfaCodeResponse(correctMfaCodeResponse);
    await new CheckYourPhonePage(requirePage(this)).enterCodeAndContinue(
      "123456"
    );
  }
);
