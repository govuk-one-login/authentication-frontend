import { When } from "@cucumber/cucumber";
import type { PlaywrightWorld } from "../support/world";
import { requirePage } from "../support/utils";
import { stub } from "../support/stub";
import { EnterAuthenticatorAppCodePage } from "../pages/EnterAuthenticatorAppCodePage";
import {
  correctMfaCodeResponse,
  incorrectAuthAppCodeLockoutResponse,
  incorrectAuthAppCodeResponse,
} from "../responses/verify-mfa-code";

When(
  "the user enters the correct security code from their auth app",
  async function (this: PlaywrightWorld): Promise<void> {
    await stub.setVerifyMfaCodeResponse(correctMfaCodeResponse);
    await new EnterAuthenticatorAppCodePage(
      requirePage(this)
    ).enterCodeAndContinue("123456");
  }
);

When(
  "the user enters an incorrect auth app security code that the backend rejects without locking the account",
  async function (this: PlaywrightWorld): Promise<void> {
    await stub.setVerifyMfaCodeResponse(incorrectAuthAppCodeResponse);
    await new EnterAuthenticatorAppCodePage(
      requirePage(this)
    ).enterCodeAndContinue("000000");
  }
);

When(
  "the user enters an incorrect auth app security code and the backend reports the code lockout limit has been reached",
  async function (this: PlaywrightWorld): Promise<void> {
    await stub.setVerifyMfaCodeResponse(incorrectAuthAppCodeLockoutResponse);
    await new EnterAuthenticatorAppCodePage(
      requirePage(this)
    ).enterCodeAndContinue("000000");
  }
);
