import { EMAIL } from "../support/constants";

export const existingAccountUserExistsResponse = {
  status: 200,
  body: {
    email: EMAIL,
    doesUserExist: true,
    hasActivePasskey: false,
  },
};
