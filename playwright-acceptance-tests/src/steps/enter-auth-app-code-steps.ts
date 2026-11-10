import { When } from "@cucumber/cucumber";
import type { PlaywrightWorld } from "../support/world";
import { requirePage } from "../support/utils";
import { stub } from "../support/stub";
import { EnterAuthenticatorAppCodePage } from "../pages/EnterAuthenticatorAppCodePage";
import { correctMfaCodeResponse } from "../responses/verify-mfa-code";

When(
  "the user enters the correct security code from their auth app",
  async function (this: PlaywrightWorld): Promise<void> {
    await stub.setVerifyMfaCodeResponse(correctMfaCodeResponse);
    await new EnterAuthenticatorAppCodePage(
      requirePage(this)
    ).enterCodeAndContinue("123456");
  }
);
