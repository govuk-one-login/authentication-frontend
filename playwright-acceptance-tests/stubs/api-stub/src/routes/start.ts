import type { Request, Response } from "express";
import { state } from "../state.js";

export function startHandler(req: Request, res: Response): void {
  const stubbed = state.stubbedApiResponses.startResponse;

  if (!stubbed) {
    res.status(500).json({
      message: "No start response stubbed. The step must stub this response.",
    });
    return;
  }

  res.status(stubbed.status).json(stubbed.body);
  return;
}
