import { Given } from "@cucumber/cucumber";
import { stub } from "../support/stub";
import {
  authenticatedStartResponse,
  authenticatedStartResponseRequiringUpliftWithAuthApp,
  authenticatedStartResponseRequiringUpliftWithSMSMFA,
  unauthenticatedStartResponse,
  unauthenticatedStartResponseForSmsUserWithMfaNotRequired,
} from "../responses/start";
import { mfaCodeSentResponse } from "../responses/mfa";

Given(
  "a user does not have an authenticated session",
  async function (): Promise<void> {
    await stub.setStartResponse(unauthenticatedStartResponse);
  }
);

Given(
  "a user does not have an authenticated session and does not require 2fa",
  async function (): Promise<void> {
    await stub.setStartResponse(
      unauthenticatedStartResponseForSmsUserWithMfaNotRequired
    );
  }
);

Given(
  "the user has an authenticated session that requires uplift with sms",
  async function (): Promise<void> {
    await stub.setStartResponse(
      authenticatedStartResponseRequiringUpliftWithSMSMFA
    );
    await stub.setMfaResponse(mfaCodeSentResponse);
  }
);

Given(
  "a user has an authenticated session that requires uplift with auth app",
  async function (): Promise<void> {
    await stub.setStartResponse(
      authenticatedStartResponseRequiringUpliftWithAuthApp
    );
  }
);

Given("a user has an authenticated session", async function (): Promise<void> {
  await stub.setStartResponse(authenticatedStartResponse);
});
