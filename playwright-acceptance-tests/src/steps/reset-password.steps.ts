import { When } from "@cucumber/cucumber";
import type { PlaywrightWorld } from "../support/world";
import { requirePage } from "../support/utils";
import { stub } from "../support/stub";
import { EnterPasswordPage } from "../pages/EnterPasswordPage";
import { ResetPasswordPage } from "../pages/ResetPasswordPage";
import { VALID_PASSWORD } from "../support/constants";
import {
  resetPasswordSmsResponse,
  resetPasswordAuthAppResponse,
  resetPasswordNoMfaResponse,
  successfulResetPasswordResponse,
} from "../responses/reset-password";
import {correctPasswordAuthAppResponse, partiallyRegisteredUserLoginResponse} from "../responses/login";
import { mfaCodeSentResponse } from "../responses/mfa";

When(
  "the user clicks the forgotten password link and a password reset is permitted via SMS",
  async function (this: PlaywrightWorld): Promise<void> {
    await stub.setResetPasswordRequestResponse(resetPasswordSmsResponse);
    await stub.setMfaResponse(mfaCodeSentResponse);
    await new EnterPasswordPage(requirePage(this)).clickForgottenPasswordLink();
  }
);

When(
  "the user clicks the forgotten password link and a password reset is permitted via their Auth App",
  async function (this: PlaywrightWorld): Promise<void> {
    await stub.setResetPasswordRequestResponse(resetPasswordAuthAppResponse);
    await new EnterPasswordPage(requirePage(this)).clickForgottenPasswordLink();
  }
);

When(
  "the user clicks the forgotten password link and a password reset is permitted but the user has not set up mfa",
  async function (this: PlaywrightWorld): Promise<void> {
    const page = requirePage(this);
    await stub.setResetPasswordRequestResponse(resetPasswordNoMfaResponse);
    await new EnterPasswordPage(page).clickForgottenPasswordLink();
  }
);

When(
  "the partially registered user successfully resets their password",
  async function (this: PlaywrightWorld): Promise<void> {
    const resetPasswordPage = new ResetPasswordPage(requirePage(this));
    await resetPasswordPage.assertLoaded();
    await stub.setResetPasswordResponse(successfulResetPasswordResponse);
    await stub.setCorrectPasswordResponse(partiallyRegisteredUserLoginResponse);
    await resetPasswordPage.resetPasswordAndContinue(VALID_PASSWORD);
  }
);

When(
  "the user with Auth App MFA successfully resets their password",
  async function (this: PlaywrightWorld): Promise<void> {
    const resetPasswordPage = new ResetPasswordPage(requirePage(this));
    await resetPasswordPage.assertLoaded();
    await stub.setResetPasswordResponse(successfulResetPasswordResponse);
    await stub.setCorrectPasswordResponse(correctPasswordAuthAppResponse);
    await resetPasswordPage.resetPasswordAndContinue(VALID_PASSWORD);
  }
);
