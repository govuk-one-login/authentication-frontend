import { When } from "@cucumber/cucumber";
import type { PlaywrightWorld } from "../support/world";
import { requirePage } from "../support/utils";
import { stub } from "../support/stub";
import { EnterPasswordPage } from "../pages/EnterPasswordPage";
import { resetPasswordSmsResponse } from "../responses/reset-password";

When(
  "the user clicks the forgotten password link and a password reset is permitted via SMS",
  async function (this: PlaywrightWorld): Promise<void> {
    await stub.setResetPasswordRequestResponse(resetPasswordSmsResponse);
    await new EnterPasswordPage(requirePage(this)).clickForgottenPasswordLink();
  }
);
