import type { Request, Response } from "express";
import { state } from "../state.js";

export function resetPasswordHandler(_req: Request, res: Response): void {
  const stubbed = state.stubbedApiResponses.resetPasswordResponse;
  if (!stubbed) {
    res.status(500).json({
      message:
        "No resetPasswordResponse stubbed. The step must stub this response before triggering /reset-password.",
    });
    return;
  }

  if (stubbed.body) {
    res.status(stubbed.status).json(stubbed.body);
  } else {
    res.sendStatus(stubbed.status);
  }
}
