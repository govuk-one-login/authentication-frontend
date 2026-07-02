import type { Request, Response } from "express";
import { TEST_EMAIL } from "../constants.js";
import { state } from "../state.js";

interface SignupRequest {
  email?: string;
}

export function signUpHandler(req: Request, res: Response): void {
  const { email = TEST_EMAIL.NEW_USER } = req.body as SignupRequest;
  state.registered[email] = true;
  res.json({ email: TEST_EMAIL.SMS_USER, consentRequired: false });
}
