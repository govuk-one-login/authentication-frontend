import type { Request, Response } from "express";

interface OrchAuthCodeRequest {
  state: string;
}

export function authenticationAuthCodeHandler(
  req: Request,
  res: Response
): void {
  const { state } = req.body as OrchAuthCodeRequest;
  const baseUrl = process.env.ORCHESTRATION_REDIRECT_URL || "http://proxy";
  res.json({
    location: `${baseUrl}/orchestration-redirect?code=auth-code-123&state=${state}`,
  });
}
