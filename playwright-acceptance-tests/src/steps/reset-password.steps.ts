import { When } from "@cucumber/cucumber";
import type { PlaywrightWorld } from "../support/world";
import { requirePage } from "../support/utils";
import { stub } from "../support/stub";
import { EnterPasswordPage } from "../pages/EnterPasswordPage";
import { CheckYourEmailPage } from "../pages/CheckYourEmailPage";
import { ResetPasswordPage } from "../pages/ResetPasswordPage";
import { VALID_PASSWORD } from "../support/constants";
import {
  resetPasswordSmsResponse,
  resetPasswordNoMfaResponse,
  successfulResetPasswordResponse,
} from "../responses/reset-password";
import { correctEmailCodeResponse } from "../responses/verify-code";
import { partiallyRegisteredUserLoginResponse } from "../responses/login";

When(
  "the user clicks the forgotten password link and a password reset is permitted via SMS",
  async function (this: PlaywrightWorld): Promise<void> {
    await stub.setResetPasswordRequestResponse(resetPasswordSmsResponse);
    await new EnterPasswordPage(requirePage(this)).clickForgottenPasswordLink();
  }
);

When(
  "the user resets their password using the forgotten password link",
  async function (this: PlaywrightWorld): Promise<void> {
    const page = requirePage(this);

    await stub.setResetPasswordRequestResponse(resetPasswordNoMfaResponse);
    await new EnterPasswordPage(page).clickForgottenPasswordLink();

    const checkYourEmailPage = new CheckYourEmailPage(page);
    await checkYourEmailPage.assertLoaded(/check your email/i);
    await stub.setVerifyCodeResponse(correctEmailCodeResponse);
    await checkYourEmailPage.enterCodeAndContinue("123456");

    const resetPasswordPage = new ResetPasswordPage(page);
    await resetPasswordPage.assertLoaded();
    await stub.setResetPasswordResponse(successfulResetPasswordResponse);
    await stub.setCorrectPasswordResponse(partiallyRegisteredUserLoginResponse);
    await resetPasswordPage.resetPasswordAndContinue(VALID_PASSWORD);
  }
);
