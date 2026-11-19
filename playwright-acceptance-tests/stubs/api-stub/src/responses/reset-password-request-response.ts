export const defaultResetPasswordRequestResponse = {
  mfaMethodType: "SMS",
  phoneNumberLastThree: "890",
  mfaMethods: [
    {
      id: "stub-mfa-id",
      type: "SMS",
      priority: "DEFAULT",
      redactedPhoneNumber: "****7890",
    },
  ],
};
