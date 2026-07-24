import type { Request, Response } from "express";
import {
  CredentialStrength,
  ErrorCode,
  MfaLockReason,
  MfaMethodType,
  TEST_EMAIL,
} from "../constants.js";
import { state } from "../state.js";

const VALID_PASSWORD = "valid-password-1";
const MAX_LOGIN_ATTEMPTS = 6;
const AUTH_APP_EMAILS: readonly string[] = [
  TEST_EMAIL.AUTH_APP_USER,
  TEST_EMAIL.NEW_USER,
];

interface LoginRequest {
  email?: string;
  password: string;
}

export function loginHandler(req: Request, res: Response): void {
  const { email = TEST_EMAIL.SMS_USER, password } = req.body as LoginRequest;
  const mfaLockReason = state.lockedOutMfa[email];
  const isAuthAppUser = AUTH_APP_EMAILS.includes(email);
  const isPasswordOnly =
    state.credentialStrength === CredentialStrength.PASSWORD_ONLY;

  // Prior MFA lockout — reject even with correct password
  if (mfaLockReason) {
    const code =
      mfaLockReason === MfaLockReason.MAX_RESENDS
        ? ErrorCode.MFA_CODE_REQUESTS_BLOCKED
        : ErrorCode.ENTERED_INVALID_MFA_MAX_TIMES;
    const message =
      mfaLockReason === MfaLockReason.MAX_RESENDS
        ? "MFA code requests blocked"
        : "Entered invalid MFA max times";
    res.status(400).json({ code, message });
    return;
  }

  // Wrong password
  if (password !== VALID_PASSWORD) {
    state.loginAttempts[email] = (state.loginAttempts[email] || 0) + 1;
    if (state.loginAttempts[email] >= MAX_LOGIN_ATTEMPTS) {
      state.lockedOutPassword[email] = true;
      res.status(400).json({
        code: ErrorCode.INVALID_PASSWORD_MAX_ATTEMPTS_REACHED,
        message: "Invalid password max attempts reached",
      });
      return;
    }
    res.status(400).json({
      code: ErrorCode.INVALID_CREDENTIALS,
      message: "Invalid password",
    });
    return;
  }

  // Correct password
  state.userMfaMethodType = isAuthAppUser
    ? MfaMethodType.AUTH_APP
    : MfaMethodType.SMS;
  if (isPasswordOnly) {
    state.authenticated = true;
    state.authenticatedCredentialStrength = CredentialStrength.PASSWORD_ONLY;
  }

  res.json(getLoginResponseForUser(isAuthAppUser));
}

const getLoginResponseForUser = (isAuthAppUser: boolean) => ({
  redactedPhoneNumber: "****7890",
  mfaMethodType: isAuthAppUser ? MfaMethodType.AUTH_APP : MfaMethodType.SMS,
  latestTermsAndConditionsAccepted: state.latestTermsAndConditionsAccepted,
  mfaMethodVerified: true,
  passwordChangeRequired: false,
  mfaMethods: [
    {
      id: "stub-mfa-method-id",
      type: isAuthAppUser ? MfaMethodType.AUTH_APP : MfaMethodType.SMS,
      priority: "DEFAULT",
      redactedPhoneNumber: !isAuthAppUser && "****7890",
    },
  ],
});
