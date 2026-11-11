import type { Request, Response } from "express";
import { ErrorCode, MfaLockReason, TEST_EMAIL } from "../constants.js";
import { state } from "../state.js";

const MAX_RESEND_COUNT = 6;

export function mfaHandler(_req: Request, res: Response): void {
  const stubbed = state.stubbedApiResponses.mfaResponse as
    { status: number; body?: unknown } | undefined;
  if (stubbed) {
    if (stubbed.body) {
      res.status(stubbed.status).json(stubbed.body);
    } else {
      res.sendStatus(stubbed.status);
    }
    return;
  }

  state.mfaResendCount++;
  if (state.mfaResendCount >= MAX_RESEND_COUNT) {
    state.lockedOutMfa[TEST_EMAIL.SMS_USER] = MfaLockReason.MAX_RESENDS;
    res.status(400).json({
      code: ErrorCode.MFA_SMS_MAX_CODES_SENT,
      message: "MFA SMS max codes sent",
    });
    return;
  }
  res.sendStatus(204);
}
