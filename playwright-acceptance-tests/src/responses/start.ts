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
};
