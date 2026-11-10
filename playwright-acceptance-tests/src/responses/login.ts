export const correctPasswordSmsResponse = {
  status: 200,
  body: {
    redactedPhoneNumber: "****7890",
    mfaMethodType: "SMS",
    latestTermsAndConditionsAccepted: true,
    mfaMethodVerified: true,
    passwordChangeRequired: false,
    mfaMethods: [
      {
        id: "stub-mfa-method-id",
        type: "SMS",
        priority: "DEFAULT",
        redactedPhoneNumber: "****7890",
      },
    ],
  },
};

export const correctPasswordSmsResponseWithOutdatedTerms = {
  status: 200,
  body: {
    ...correctPasswordSmsResponse.body,
    latestTermsAndConditionsAccepted: false,
  },
};
