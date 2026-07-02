export enum MfaMethodType {
  SMS = "SMS",
  AUTH_APP = "AUTH_APP",
}

export enum CredentialStrength {
  PASSWORD_ONLY = "Cl",
  PASSWORD_AND_MFA = "Cl.Cm",
}

export enum MfaLockReason {
  INVALID_CODE = "code",
  MAX_RESENDS = "resend",
}

/**
 * API error codes — subset matching src/components/common/constants.ts in the
 * main frontend codebase.
 */
export enum ErrorCode {
  INVALID_CREDENTIALS = 1008,
  MFA_SMS_MAX_CODES_SENT = 1025,
  MFA_CODE_REQUESTS_BLOCKED = 1026,
  ENTERED_INVALID_MFA_MAX_TIMES = 1027,
  INVALID_PASSWORD_MAX_ATTEMPTS_REACHED = 1028,
  ENTERED_INVALID_VERIFY_PHONE_NUMBER_CODE_MAX_TIMES = 1034,
  INVALID_MFA_CODE = 1035,
  AUTH_APP_INVALID_CODE_MAX_ATTEMPTS_REACHED = 1042,
  AUTH_APP_INVALID_CODE = 1043,
  ACCOUNT_LOCKED = 1045,
}

export const TEST_EMAIL = {
  SMS_USER: "test@example.com",
  AUTH_APP_USER: "authapp@example.com",
  NEW_USER: "newuser@example.com",
  PASSKEY_USER: "passkey@example.com",
} as const;
