import type { UserExistsResponse } from "../../stubs/api-stub/src/responses/api-responses.type";
import { EMAIL } from "../support/constants";

export const existingAccountUserExistsResponse = {
  status: 200,
  body: {
    email: EMAIL,
    doesUserExist: true,
    hasActivePasskey: false,
  },
} satisfies UserExistsResponse;

export const nonExistingAccountUserExistsResponse = {
  status: 200,
  body: {
    email: EMAIL,
    doesUserExist: false,
    hasActivePasskey: false,
  },
} satisfies UserExistsResponse;

export const existingAccountWithPasskeyUserExistsResponse = {
  status: 200,
  body: {
    email: EMAIL,
    doesUserExist: true,
    hasActivePasskey: true,
  },
} satisfies UserExistsResponse;

export const accountLockedUserExistsResponse = {
  status: 400,
  body: {
    code: 1045,
    message: "Account locked",
  },
};
