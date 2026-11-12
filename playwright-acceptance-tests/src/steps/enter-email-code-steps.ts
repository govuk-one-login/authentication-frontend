import { When } from "@cucumber/cucumber";
import type { PlaywrightWorld } from "../support/world";
import { requirePage } from "../support/utils";
import { stub } from "../support/stub";
import { CheckYourEmailPage } from "../pages/CheckYourEmailPage";
import { correctEmailCodeResponse } from "../responses/verify-code";
import { mfaCodeSentResponse } from "../responses/mfa";

const VALID_MFA_CODE = "123456";

When(
  "the user enters the correct six digit security code from their email",
  async function (this: PlaywrightWorld): Promise<void> {
    await stub.setVerifyCodeResponse(correctEmailCodeResponse);
    await new CheckYourEmailPage(requirePage(this)).enterCodeAndContinue(
      VALID_MFA_CODE
    );
  }
);

When(
  "the user enters the correct six digit security code from their email for password reset with sms",
  async function (this: PlaywrightWorld): Promise<void> {
    await stub.setVerifyCodeResponse(correctEmailCodeResponse);
    await stub.setMfaResponse(mfaCodeSentResponse);
    await new CheckYourEmailPage(requirePage(this)).enterCodeAndContinue(
      VALID_MFA_CODE
    );
  }
);
