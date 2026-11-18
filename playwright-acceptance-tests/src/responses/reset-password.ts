export const resetPasswordSmsResponse = {
  status: 200,
  body: {
    mfaMethodType: "SMS",
    phoneNumberLastThree: "890",
    mfaMethods: [
      {
        id: "stub-mfa-id",
        type: "SMS",
        priority: "DEFAULT",
        phoneNumber: "07000000000",
      },
    ],
  },
};

export const resetPasswordAuthAppResponse = {
  status: 200,
  body: {
    mfaMethodType: "AUTH_APP",
    phoneNumberLastThree: "890",
    mfaMethods: [
      {
        id: "stub-mfa-id",
        type: "AUTH_APP",
        priority: "DEFAULT",
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
