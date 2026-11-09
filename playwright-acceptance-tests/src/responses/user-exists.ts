import { TEST_EMAIL } from "../support/constants";

export const existingAccountUserExistsResponse = {
  status: 200,
  body: {
    email: TEST_EMAIL.SMS_USER,
    doesUserExist: true,
    hasActivePasskey: false,
  },
};
