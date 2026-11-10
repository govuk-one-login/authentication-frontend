import { When } from "@cucumber/cucumber";
import type { PlaywrightWorld } from "../support/world";
import { requirePage } from "../support/utils";
import { stub } from "../support/stub";
import { CheckYourEmailPage } from "../pages/CheckYourEmailPage";
import { correctEmailCodeResponse } from "../responses/verify-code";

When(
  "the user enters the correct six digit security code from their email",
  async function (this: PlaywrightWorld): Promise<void> {
    await stub.setVerifyCodeResponse(correctEmailCodeResponse);
    await new CheckYourEmailPage(requirePage(this)).enterCodeAndContinue(
      "123456"
    );
  }
);
