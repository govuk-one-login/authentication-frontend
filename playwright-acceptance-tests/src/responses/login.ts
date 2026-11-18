import type { LoginResponse } from "../../stubs/api-stub/src/responses/api-responses.type";

export const correctPasswordSmsResponse = {
  status: 200,
  body: {
    redactedPhoneNumber: "****7890",
    mfaMethodType: "SMS",
    latestTermsAndConditionsAccepted: true,
    mfaMethodVerified: true,
    passwordChangeRequired: false,
    mfaMethods: [
      {
        id: "stub-mfa-method-id",
        type: "SMS",
        priority: "DEFAULT",
        redactedPhoneNumber: "****7890",
      },
    ],
  },
} satisfies LoginResponse;

export const correctPasswordSmsResponseWithOutdatedTerms = {
  status: 200,
  body: {
    ...correctPasswordSmsResponse.body,
    latestTermsAndConditionsAccepted: false,
  },
} satisfies LoginResponse;

export const correctPasswordAuthAppResponse = {
  status: 200,
  body: {
    mfaMethodType: "AUTH_APP",
    latestTermsAndConditionsAccepted: true,
    mfaMethodVerified: true,
    passwordChangeRequired: false,
    mfaMethods: [
      {
        id: "stub-mfa-method-id",
        type: "AUTH_APP",
        priority: "DEFAULT",
      },
    ],
  },
} satisfies LoginResponse;

export const incorrectPasswordResponse = {
  status: 400,
  body: {
    code: 1008,
    message: "Invalid password",
  },
};

export const incorrectPasswordLockoutResponse = {
  status: 400,
  body: {
    code: 1028,
    message: "Invalid password max attempts reached",
  },
};

export const partiallyRegisteredUserLoginResponse = {
  status: 200,
  body: {
    mfaMethodType: "NONE",
    latestTermsAndConditionsAccepted: true,
    mfaMethodVerified: false,
    passwordChangeRequired: false,
    mfaMethods: [],
  },
} satisfies LoginResponse;
