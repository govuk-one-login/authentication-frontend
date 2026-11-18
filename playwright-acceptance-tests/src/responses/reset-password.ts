import type { ResetPasswordRequestResponse } from "../../stubs/api-stub/src/responses/api-responses.type";

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
        redactedPhoneNumber: "****7890",
      },
    ],
  },
} satisfies ResetPasswordRequestResponse;

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
} satisfies ResetPasswordRequestResponse;

export const resetPasswordNoMfaResponse = {
  status: 200,
  body: {
    mfaMethods: [],
  },
} satisfies ResetPasswordRequestResponse;

export const successfulResetPasswordResponse = {
  status: 204,
};
