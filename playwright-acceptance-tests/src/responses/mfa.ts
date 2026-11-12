export const mfaCodeSentResponse = {
  status: 204,
};

export const mfaResendLockoutResponse = {
  status: 400,
  body: {
    code: 1025,
    message: "MFA SMS max codes sent",
  },
};
