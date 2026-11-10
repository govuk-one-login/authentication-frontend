import type { MfaMethodType } from "../constants.js";

export interface StartResponse {
  status: number;
  body: {
    sessionId: string;
    user: {
      upliftRequired: boolean;
      identityRequired: boolean;
      authenticated: boolean;
      mfaMethodType: MfaMethodType;
      mfaRequired: boolean;
      isBlockedForReauth: boolean;
    };
    featureFlags: Record<string, boolean>;
  };
}
