import type { Request, Response } from "express";
import { state } from "../state.js";

export function verifyMfaCodeHandler(req: Request, res: Response): void {
  const stubbed = state.stubbedApiResponses.verifyMfaCodeResponse;
  if (!stubbed) {
    res.status(500).json({
      message: "No stubbed response set for verify mfa code response",
    });
    return;
  }

  if (stubbed.body) {
    res.status(stubbed.status).json(stubbed.body);
  } else {
    res.sendStatus(stubbed.status);
  }
}
