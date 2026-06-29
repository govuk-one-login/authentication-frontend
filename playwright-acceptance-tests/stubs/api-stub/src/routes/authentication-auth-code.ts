import type { Request, Response } from "express";

interface OrchAuthCodeRequest {
  state: string;
}

export function authenticationAuthCodeHandler(
  req: Request,
  res: Response
): void {
  const { state } = req.body as OrchAuthCodeRequest;
  res.json({
    location: `http://proxy/orchestration-redirect?code=auth-code-123&state=${state}`,
  });
}
