import { When } from "@cucumber/cucumber";
import type { PlaywrightWorld } from "../support/world";
import { requirePage } from "../support/utils";
import { stub } from "../support/stub";
import { CreatePasswordPage } from "../pages/CreatePasswordPage";
import {
  VALID_PASSWORD,
  INVALID_PASSWORD,
  WEAK_PASSWORD,
  SHORT_NUMERIC_PASSWORD,
  SEQUENTIAL_NUMBERS_PASSWORD,
} from "../support/constants";
import {
  successfulSignUpResponse,
  commonPasswordSignUpResponse,
} from "../responses/sign-up";

When(
  "the user successfully creates a password",
  async function (this: PlaywrightWorld): Promise<void> {
    await stub.setSignUpResponse(successfulSignUpResponse);
    await new CreatePasswordPage(requirePage(this)).createPasswordAndContinue(
      VALID_PASSWORD
    );
  }
);

When(
  "the user creates and enters an invalid password and clicks continue",
  async function (this: PlaywrightWorld): Promise<void> {
    await new CreatePasswordPage(requirePage(this)).createPasswordAndContinue(
      INVALID_PASSWORD
    );
  }
);

When(
  "the user creates and enters a weak password and clicks continue",
  async function (this: PlaywrightWorld): Promise<void> {
    // A weak password passes local validation, so the backend is what
    // rejects it as a common password.
    await stub.setSignUpResponse(commonPasswordSignUpResponse);
    await new CreatePasswordPage(requirePage(this)).createPasswordAndContinue(
      WEAK_PASSWORD
    );
  }
);

When(
  "the user creates and enters a short digit only password and clicks continue",
  async function (this: PlaywrightWorld): Promise<void> {
    await new CreatePasswordPage(requirePage(this)).createPasswordAndContinue(
      SHORT_NUMERIC_PASSWORD
    );
  }
);

When(
  "the user creates and enters a sequence of numbers password and clicks continue",
  async function (this: PlaywrightWorld): Promise<void> {
    await new CreatePasswordPage(requirePage(this)).createPasswordAndContinue(
      SEQUENTIAL_NUMBERS_PASSWORD
    );
  }
);
