import type { Request, Response } from "express";
import { ErrorCode, TEST_EMAIL } from "../constants.js";
import { state } from "../state.js";

interface UserExistsRequest {
  email?: string;
}

export function checkUserExistsHandler(req: Request, res: Response): void {
  const { email = TEST_EMAIL.SMS_USER } = req.body as UserExistsRequest;

  if (state.lockedOutPassword[email]) {
    res
      .status(400)
      .json({ code: ErrorCode.ACCOUNT_LOCKED, message: "Account locked" });
    return;
  }
  if (email === TEST_EMAIL.PASSKEY_USER) {
    res.json({ email, doesUserExist: true, hasActivePasskey: true });
    return;
  }
  if (email === TEST_EMAIL.NEW_USER && !state.registered[email]) {
    res.json({ email, doesUserExist: false });
    return;
  }
  res.json({ email, doesUserExist: true, hasActivePasskey: false });
}
