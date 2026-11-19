import type { StartResponse } from "../../stubs/api-stub/src/responses/api-responses.type";

export const unauthenticatedStartResponse = {
  status: 200,
  body: {
    sessionId: "session-123",
    user: {
      upliftRequired: false,
      identityRequired: false,
      authenticated: false,
      mfaMethodType: "SMS",
      mfaRequired: true,
      isBlockedForReauth: false,
    },
    featureFlags: {},
  },
} satisfies StartResponse;

export const unauthenticatedStartResponseForSmsUserWithMfaNotRequired = {
  status: 200,
  body: {
    sessionId: "session-123",
    user: {
      upliftRequired: true,
      identityRequired: false,
      authenticated: false,
      mfaMethodType: "SMS",
      mfaRequired: false,
      isBlockedForReauth: false,
    },
    featureFlags: {},
  },
} satisfies StartResponse;

export const authenticatedStartResponseRequiringUpliftWithSMSMFA = {
  status: 200,
  body: {
    sessionId: "session-123",
    user: {
      upliftRequired: true,
      identityRequired: false,
      authenticated: true,
      mfaMethodType: "SMS",
      mfaRequired: true,
      isBlockedForReauth: false,
    },
    featureFlags: {},
  },
} satisfies StartResponse;

export const authenticatedStartResponseRequiringUpliftWithAuthApp = {
  status: 200,
  body: {
    sessionId: "session-123",
    user: {
      upliftRequired: true,
      identityRequired: false,
      authenticated: true,
      mfaMethodType: "AUTH_APP",
      mfaRequired: true,
      isBlockedForReauth: false,
    },
    featureFlags: {},
  },
} satisfies StartResponse;

export const authenticatedStartResponse = {
  status: 200,
  body: {
    sessionId: "session-123",
    user: {
      upliftRequired: false,
      identityRequired: false,
      authenticated: true,
      mfaMethodType: "SMS",
      mfaRequired: true,
      isBlockedForReauth: false,
    },
    featureFlags: {},
  },
} satisfies StartResponse;
