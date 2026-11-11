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

export const incorrectPasswordResponse = {
  status: 400,
  body: {
    code: 1008,
    message: "Invalid password",
  },
};

export const incorrectPasswordLockoutResponse = {
  status: 400,
  body: {
    code: 1028,
    message: "Invalid password max attempts reached",
  },
};
