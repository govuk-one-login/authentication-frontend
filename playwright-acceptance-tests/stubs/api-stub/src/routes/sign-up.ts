import type { Request, Response } from "express";
import { state } from "../state.js";

export function signUpHandler(_req: Request, res: Response): void {
  const stubbed = state.stubbedApiResponses.signUpResponse;
  if (!stubbed) {
    res.status(500).json({
      message:
        "No signUpResponse stubbed. The step must stub this response before triggering /signup.",
    });
    return;
  }

  if (stubbed.body) {
    res.status(stubbed.status).json(stubbed.body);
  } else {
    res.sendStatus(stubbed.status);
  }
}
