export const correctMfaCodeResponse = {
  status: 204,
};

export const incorrectAuthAppCodeResponse = {
  status: 400,
  body: {
    code: 1043,
    message: "Auth app invalid code",
  },
};

export const incorrectAuthAppCodeLockoutResponse = {
  status: 400,
  body: {
    code: 1042,
    message: "Auth app invalid code max attempts reached",
  },
};
