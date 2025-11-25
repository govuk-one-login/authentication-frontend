import type { Request, Response } from "express";

export function shouldPromptToRegisterPasskey(
  req: Request,
  res: Response
): boolean {
  return (
    req.session.user?.hasActivePasskey === false &&
    res.locals.supportPasskeyRegistration === true
  );
}

export function shouldPromptToSignInWithPasskey(
  req: Request,
  res: Response
): boolean {
  return (
    req.session.user?.hasActivePasskey === true &&
    res.locals.supportPasskeyUsage === true
  );
}
