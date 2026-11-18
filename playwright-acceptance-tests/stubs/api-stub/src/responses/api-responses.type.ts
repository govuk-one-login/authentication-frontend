import type { MfaMethodType as MfaMethodTypeEnum } from "../constants.js";

type MfaMethodType = `${MfaMethodTypeEnum}`;

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

export interface UserExistsResponse {
  status: number;
  body: {
    email: string;
    doesUserExist: boolean;
    hasActivePasskey?: boolean;
  };
}

export interface SignUpResponse {
  status: number;
  body?: {
    email?: string;
    consentRequired?: boolean;
    code?: number;
    message?: string;
  };
}

export interface VerifyCodeResponse {
  status: number;
  body?: {
    code: number;
    message: string;
  };
}

export interface VerifyMfaCodeResponse {
  status: number;
  body?: {
    code: number;
    message: string;
  };
}

export interface MfaResponse {
  status: number;
  body?: {
    code: number;
    message: string;
  };
}

export interface AccountInterventionsResponse {
  status: number;
  body: {
    passwordResetRequired: boolean;
    blocked: boolean;
    temporarilySuspended: boolean;
    reproveIdentity: boolean;
    appliedAt: number;
  };
}

export interface ResetPasswordResponse {
  status: number;
  body?: {
    code: number;
    message: string;
  };
}

interface ResetPasswordRequestMfaMethod {
  id: string;
  type: MfaMethodType;
  priority: string;
  redactedPhoneNumber?: string;
}

export interface ResetPasswordRequestResponse {
  status: number;
  body: {
    mfaMethodType?: MfaMethodType;
    phoneNumberLastThree?: string;
    mfaMethods: ResetPasswordRequestMfaMethod[];
  };
}
