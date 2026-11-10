import type { Request, Response } from "express";
import { state } from "../state.js";
import { defaultResetPasswordRequestResponse } from "../responses/reset-password-request-response.js";

export function resetPasswordRequestHandler(
  _req: Request,
  res: Response
): void {
  const stubbed = state.stubbedApiResponses.resetPasswordRequestResponse;
  if (stubbed) {
    res.status(stubbed.status).json(stubbed.body);
    return;
  }

  res.json(defaultResetPasswordRequestResponse);
}
