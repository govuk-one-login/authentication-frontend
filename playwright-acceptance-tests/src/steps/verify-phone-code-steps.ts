import { When, Then } from "@cucumber/cucumber";
import type { PlaywrightWorld } from "../support/world";
import { requirePage } from "../support/utils";
import { stub } from "../support/stub";
import { CheckYourPhonePage } from "../pages/CheckYourPhonePage";
import { LockoutPage } from "../pages/LockoutPage";
import { correctMfaCodeResponse } from "../responses/verify-mfa-code";
import {
  incorrectSmsCodeResponse,
  incorrectSmsCodeLockoutResponse,
} from "../responses/verify-code";
import { mfaResendLockoutResponse } from "../responses/mfa";

When(
  "the user enters the correct six digit security code from their phone",
  async function (this: PlaywrightWorld): Promise<void> {
    await stub.setVerifyCodeResponse(correctMfaCodeResponse);
    // await stub.setVerifyMfaCodeResponse(correctMfaCodeResponse);
    await new CheckYourPhonePage(requirePage(this)).enterCodeAndContinue(
      "123456"
    );
  }
);

When(
  "the user enters the correct six digit security code from their phone for account creation",
  async function (this: PlaywrightWorld): Promise<void> {
    await stub.setVerifyMfaCodeResponse(correctMfaCodeResponse);
    await new CheckYourPhonePage(requirePage(this)).enterCodeAndContinue(
      "123456"
    );
  }
);

When(
  "the user enters an incorrect phone security code",
  async function (this: PlaywrightWorld): Promise<void> {
    await stub.setVerifyCodeResponse(incorrectSmsCodeResponse);
    await new CheckYourPhonePage(requirePage(this)).enterCodeAndContinue(
      "000000"
    );
  }
);

When(
  "the user enters an incorrect phone security code and the backend reports the code lockout limit has been reached",
  async function (this: PlaywrightWorld): Promise<void> {
    await stub.setVerifyCodeResponse(incorrectSmsCodeLockoutResponse);
    await new CheckYourPhonePage(requirePage(this)).enterCodeAndContinue(
      "000000"
    );
  }
);

When(
  "the user requests a new phone security code and the backend reports the resend limit has been reached",
  async function (this: PlaywrightWorld): Promise<void> {
    await stub.setMfaResponse(mfaResendLockoutResponse);
    const page = requirePage(this);
    await page.getByText(/problems with the code/i).click();
    await page.getByRole("link", { name: /send the code again/i }).click();
    await page.getByRole("button", { name: /get security code/i }).click();
  }
);

Then(
  "the page says the user cannot continue for 2 hours",
  async function (this: PlaywrightWorld): Promise<void> {
    await new LockoutPage(requirePage(this)).assertBodyContains(
      "You will not be able to continue for 2 hours"
    );
  }
);
