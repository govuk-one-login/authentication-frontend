export const resetPasswordSmsResponse = {
  status: 200,
  body: {
    mfaMethodType: "SMS",
    phoneNumberLastThree: "890",
    mfaMethods: [
      {
        id: "stub-mfa-id",
        mfaMethodType: "SMS",
        priority: "DEFAULT",
        phoneNumber: "07000000000",
      },
    ],
  },
};

export const resetPasswordNoMfaResponse = {
  status: 200,
  body: {
    mfaMethods: [],
  },
};

export const successfulResetPasswordResponse = {
  status: 204,
};
