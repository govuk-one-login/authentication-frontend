import { defineParameterType, Given } from "@cucumber/cucumber";
import { stub } from "../support/stub";
import type { StubResponse } from "../support/stub";
import {
  temporarilySuspendedInterventionResponse,
  permanentlyLockedInterventionResponse,
  passwordResetInterventionResponse,
  reproveIdentityInterventionResponse,
} from "../responses/account-interventions";

defineParameterType({
  name: "intervention",
  regexp:
    /temporarily suspended|permanently locked|password reset|reprove identity/,
  transformer: (s) => s,
});

const interventionResponses: Record<string, StubResponse> = {
  "temporarily suspended": temporarilySuspendedInterventionResponse,
  "permanently locked": permanentlyLockedInterventionResponse,
  "password reset": passwordResetInterventionResponse,
  "reprove identity": reproveIdentityInterventionResponse,
};

Given(
  "the user has a {intervention} intervention",
  async function (intervention: string): Promise<void> {
    await stub.setAccountInterventionsResponse(
      interventionResponses[intervention]
    );
  }
);
