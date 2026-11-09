import { Given } from "@cucumber/cucumber";
import { stub } from "../support/stub";
import { unauthenticatedStartResponse } from "../responses/start";

Given(
  "a user does not have an authenticated session",
  async function (): Promise<void> {
    await stub.setStartResponse(unauthenticatedStartResponse);
  }
);
