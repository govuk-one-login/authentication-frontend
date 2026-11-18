import type { Request, Response } from "express";
import { state } from "../state.js";

export function checkUserExistsHandler(req: Request, res: Response): void {
  const stubbed = state.stubbedApiResponses.userExistsResponse;

  if (!stubbed) {
    res.status(500).json({
      message:
        "No user exists response stubbed. The step must stub this response.",
    });
    return;
  }

  res.status(stubbed.status).json(stubbed.body);
  return;
}
