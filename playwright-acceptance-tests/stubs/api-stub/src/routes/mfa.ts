import type { Request, Response } from "express";
import { state } from "../state.js";

export function mfaHandler(_req: Request, res: Response): void {
  const stubbed = state.stubbedApiResponses.mfaResponse;
  if (!stubbed) {
    res.status(500).json({
      message:
        "No mfaResponse stubbed. The step must stub this response before triggering /mfa.",
    });
    return;
  }

  if (stubbed.body) {
    res.status(stubbed.status).json(stubbed.body);
  } else {
    res.sendStatus(stubbed.status);
  }
}
