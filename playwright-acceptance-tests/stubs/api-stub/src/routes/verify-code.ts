import type { Request, Response } from "express";
import { ErrorCode, MfaLockReason, TEST_EMAIL } from "../constants.js";
import { state } from "../state.js";

const VALID_CODE = "123456";
const MAX_VERIFY_ATTEMPTS = 6;

interface VerifyCodeRequest {
  code: string;
}

export function verifyCodeHandler(req: Request, res: Response): void {
  const { code } = req.body as VerifyCodeRequest;

  if (code === VALID_CODE) {
    state.authenticated = true;
    res.sendStatus(204);
    return;
  }

  state.verifyCodeAttempts++;
  if (state.verifyCodeAttempts >= MAX_VERIFY_ATTEMPTS) {
    state.lockedOutMfa[TEST_EMAIL.SMS_USER] = MfaLockReason.INVALID_CODE;
    res.status(400).json({
      code: ErrorCode.ENTERED_INVALID_VERIFY_PHONE_NUMBER_CODE_MAX_TIMES,
      message: "Entered invalid verify phone number code max times",
    });
    return;
  }
  res
    .status(400)
    .json({ code: ErrorCode.INVALID_MFA_CODE, message: "Invalid MFA code" });
}
