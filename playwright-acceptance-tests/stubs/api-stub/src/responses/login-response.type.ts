import type { MfaMethodType } from "../constants.js";

interface LoginMfaMethod {
  id: string;
  type: MfaMethodType;
  priority: string;
  redactedPhoneNumber?: string;
}

export interface LoginResponse {
  status: number;
  body: {
    redactedPhoneNumber?: string;
    mfaMethodType: MfaMethodType;
    latestTermsAndConditionsAccepted: boolean;
    mfaMethodVerified: boolean;
    passwordChangeRequired: boolean;
    mfaMethods: LoginMfaMethod[];
  };
}
