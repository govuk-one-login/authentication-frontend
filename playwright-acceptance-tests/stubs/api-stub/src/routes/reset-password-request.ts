import type { Request, Response } from "express";
import { defaultResetPasswordRequestResponse } from "../responses/reset-password-request-response.js";

export function resetPasswordRequestHandler(
  _req: Request,
  res: Response
): void {
  res.json(defaultResetPasswordRequestResponse);
}
