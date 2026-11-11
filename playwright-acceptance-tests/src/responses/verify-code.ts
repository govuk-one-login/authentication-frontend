export const correctEmailCodeResponse = {
  status: 204,
};

export const incorrectSmsCodeResponse = {
  status: 400,
  body: {
    code: 1035,
    message: "Invalid MFA code",
  },
};

export const incorrectSmsCodeLockoutResponse = {
  status: 400,
  body: {
    code: 1027,
    message: "Entered invalid MFA max times",
  },
};
