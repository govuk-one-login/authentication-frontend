import { When } from "@cucumber/cucumber";
import type { PlaywrightWorld } from "../support/world";
import { requirePage } from "../support/utils";
import { stub } from "../support/stub";
import { EnterPasswordPage } from "../pages/EnterPasswordPage";
import { VALID_PASSWORD } from "../support/constants";
import {
  correctPasswordSmsResponse,
  correctPasswordSmsResponseWithOutdatedTerms,
  correctPasswordAuthAppResponse,
} from "../responses/login";

When(
  "the user enters a correct password and has sms mfa",
  async function (this: PlaywrightWorld): Promise<void> {
    await stub.setCorrectPasswordResponse(correctPasswordSmsResponse);
    await new EnterPasswordPage(requirePage(this)).enterPasswordAndContinue(
      VALID_PASSWORD
    );
  }
);

When(
  "the user enters a correct password and has auth app mfa",
  async function (this: PlaywrightWorld): Promise<void> {
    await stub.setCorrectPasswordResponse(correctPasswordAuthAppResponse);
    await new EnterPasswordPage(requirePage(this)).enterPasswordAndContinue(
      VALID_PASSWORD
    );
  }
);

When(
  "the user enters a correct password and has sms mfa but has not accepted the latest terms and conditions",
  async function (this: PlaywrightWorld): Promise<void> {
    await stub.setCorrectPasswordResponse(
      correctPasswordSmsResponseWithOutdatedTerms
    );
    await new EnterPasswordPage(requirePage(this)).enterPasswordAndContinue(
      VALID_PASSWORD
    );
  }
);
