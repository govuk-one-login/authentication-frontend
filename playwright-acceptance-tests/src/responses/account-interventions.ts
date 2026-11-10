const noIntervention = {
  reproveIdentity: false,
  blocked: false,
  temporarilySuspended: false,
  passwordResetRequired: false,
};

export const temporarilySuspendedInterventionResponse = {
  status: 200,
  body: { ...noIntervention, temporarilySuspended: true },
};

export const permanentlyLockedInterventionResponse = {
  status: 200,
  body: { ...noIntervention, blocked: true },
};

export const passwordResetInterventionResponse = {
  status: 200,
  body: {
    ...noIntervention,
    temporarilySuspended: true,
    passwordResetRequired: true,
  },
};

export const reproveIdentityInterventionResponse = {
  status: 200,
  body: {
    ...noIntervention,
    temporarilySuspended: true,
    reproveIdentity: true,
  },
};
