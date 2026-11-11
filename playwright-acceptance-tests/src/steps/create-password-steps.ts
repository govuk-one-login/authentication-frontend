import { When } from "@cucumber/cucumber";
import type { PlaywrightWorld } from "../support/world";
import { requirePage } from "../support/utils";
import { stub } from "../support/stub";
import { CreatePasswordPage } from "../pages/CreatePasswordPage";
import { VALID_PASSWORD } from "../support/constants";
import { successfulSignUpResponse } from "../responses/sign-up";

When(
  "the user successfully creates a password",
  async function (this: PlaywrightWorld): Promise<void> {
    await stub.setSignUpResponse(successfulSignUpResponse);
    await new CreatePasswordPage(requirePage(this)).createPasswordAndContinue(
      VALID_PASSWORD
    );
  }
);
