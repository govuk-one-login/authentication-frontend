import { When } from "@cucumber/cucumber";
import type { PlaywrightWorld } from "../support/world";
import { requirePage } from "../support/utils";
import { stub } from "../support/stub";
import { EnterPasswordPage } from "../pages/EnterPasswordPage";
import { ResetPasswordPage } from "../pages/ResetPasswordPage";
import { VALID_PASSWORD } from "../support/constants";
import {
  resetPasswordSmsResponse,
  resetPasswordNoMfaResponse,
  successfulResetPasswordResponse,
} from "../responses/reset-password";
import { partiallyRegisteredUserLoginResponse } from "../responses/login";

When(
  "the user clicks the forgotten password link and a password reset is permitted via SMS",
  async function (this: PlaywrightWorld): Promise<void> {
    await stub.setResetPasswordRequestResponse(resetPasswordSmsResponse);
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
