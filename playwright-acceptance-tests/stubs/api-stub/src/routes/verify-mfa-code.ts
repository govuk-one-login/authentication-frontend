import type { Request, Response } from "express";
import {
  CredentialStrength,
  ErrorCode,
  MfaLockReason,
  MfaMethodType,
  TEST_EMAIL,
} from "../constants.js";
import { state } from "../state.js";

const VALID_MFA_CODE = "123456";
const MAX_VERIFY_ATTEMPTS = 6;

interface VerifyMfaRequest {
  code: string;
  mfaMethodType: MfaMethodType;
}

export function verifyMfaCodeHandler(req: Request, res: Response): void {
  const { code, mfaMethodType } = req.body as VerifyMfaRequest;
  const isAuthApp = mfaMethodType === MfaMethodType.AUTH_APP;

  if (code === VALID_MFA_CODE) {
    state.authenticated = true;
    state.authenticatedCredentialStrength = CredentialStrength.PASSWORD_AND_MFA;
    res.sendStatus(204);
    return;
  }

  state.verifyMfaAttempts++;
  if (state.verifyMfaAttempts >= MAX_VERIFY_ATTEMPTS) {
    const lockEmail = isAuthApp
      ? TEST_EMAIL.AUTH_APP_USER
      : TEST_EMAIL.SMS_USER;
    state.lockedOutMfa[lockEmail] = MfaLockReason.INVALID_CODE;
    const errorCode = isAuthApp
      ? ErrorCode.AUTH_APP_INVALID_CODE_MAX_ATTEMPTS_REACHED
      : ErrorCode.ENTERED_INVALID_MFA_MAX_TIMES;
    const message = isAuthApp
      ? "Auth app invalid code max attempts reached"
      : "Entered invalid MFA max times";
    res.status(400).json({ code: errorCode, message });
    return;
  }

  const errorCode = isAuthApp
    ? ErrorCode.AUTH_APP_INVALID_CODE
    : ErrorCode.INVALID_MFA_CODE;
  const message = isAuthApp ? "Auth app invalid code" : "Invalid MFA code";
  res.status(400).json({ code: errorCode, message });
}
