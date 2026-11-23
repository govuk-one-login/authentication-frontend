import type { AccountInterventionsResponse } from "../../stubs/api-stub/src/responses/api-responses.type";

const noIntervention = {
  reproveIdentity: false,
  blocked: false,
  temporarilySuspended: false,
  passwordResetRequired: false,
  appliedAt: 1700000000000,
};

export const temporarilySuspendedInterventionResponse = {
  status: 200,
  body: { ...noIntervention, temporarilySuspended: true },
} satisfies AccountInterventionsResponse;

export const permanentlyLockedInterventionResponse = {
  status: 200,
  body: { ...noIntervention, blocked: true },
} satisfies AccountInterventionsResponse;

export const passwordResetInterventionResponse = {
  status: 200,
  body: {
    ...noIntervention,
    temporarilySuspended: true,
    passwordResetRequired: true,
  },
} satisfies AccountInterventionsResponse;

export const reproveIdentityInterventionResponse = {
  status: 200,
  body: {
    ...noIntervention,
    temporarilySuspended: true,
    reproveIdentity: true,
  },
} satisfies AccountInterventionsResponse;
