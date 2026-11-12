import type { Request, Response } from "express";
import { state } from "../state.js";

export function loginHandler(req: Request, res: Response): void {
  const stubbed = state.stubbedApiResponses.loginResponse;
  if (!stubbed) {
    res.status(500).json({
      message:
        "No login response stubbed. The step must stub this response before triggering /signup.",
    });
    return;
  }

  if (stubbed.body) {
    res.status(stubbed.status).json(stubbed.body);
    return;
  }
}
