import { EMAIL } from "../support/constants";

export const existingAccountUserExistsResponse = {
  status: 200,
  body: {
    email: EMAIL,
    doesUserExist: true,
    hasActivePasskey: false,
  },
};

export const nonExistingAccountUserExistsResponse = {
  status: 200,
  body: {
    email: EMAIL,
    doesUserExist: false,
    hasActivePasskey: false,
  },
};

export const existingAccountWithPasskeyUserExistsResponse = {
  status: 200,
  body: {
    email: EMAIL,
    doesUserExist: true,
    hasActivePasskey: true,
  },
};

export const accountLockedUserExistsResponse = {
  status: 400,
  body: {
    code: 1045,
    message: "Account locked",
  },
};
