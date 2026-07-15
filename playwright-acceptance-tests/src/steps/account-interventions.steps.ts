import { defineParameterType, Given } from "@cucumber/cucumber";

defineParameterType({
  name: "intervention",
  regexp:
    /temporarily suspended|permanently locked|password reset|reprove identity/,
  transformer: (s) => s,
});

Given(
  "the user has a {intervention} intervention",
  async function (intervention: string) {
    const baseIntervention = {
      reproveIdentity: false,
      blocked: false,
      temporarilySuspended: false,
      passwordResetRequired: false,
    };

    switch (intervention) {
      case "temporarily suspended":
        baseIntervention.temporarilySuspended = true;
        break;
      case "permanently locked":
        baseIntervention.blocked = true;
        break;
      case "password reset":
        baseIntervention.passwordResetRequired = true;
        break;
      case "reprove identity":
        baseIntervention.reproveIdentity = true;
        break;
    }

    const stubUrl = process.env.API_STUB_URL || "http://api-stub:8080";
    await fetch(`${stubUrl}/test/state/account-interventions`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(baseIntervention),
    }).catch(() => {});
  }
);
