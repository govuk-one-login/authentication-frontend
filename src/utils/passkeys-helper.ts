import type { Request, Response } from "express";
import { getPasskeyPromptClientAllowList } from "../config.js";

export function shouldPromptToRegisterPasskey(
  req: Request,
  res: Response
): boolean {
  return (
    req.session.user?.browserSupportsWebAuthn === true &&
    req.session.user?.hasActivePasskey === false &&
    req.session.user?.hasSkippedPasskeyRegistration !== true &&
    req.session.user?.backendIndicatesPasskeyPromptShouldBeSkipped !== true &&
    !req.session.user?.reauthenticate &&
    isPromptableRPClientID(req.session.client.rpClientId) &&
    res.locals.supportPasskeyRegistration === true
  );
}

export function shouldPromptToSignInWithPasskey(
  req: Request,
  res: Response
): boolean {
  return (
    req.session.user?.browserSupportsWebAuthn === true &&
    req.session.user?.hasActivePasskey === true &&
    res.locals.supportPasskeyUsage === true
  );
}

function isPromptableRPClientID(rpClientId: string) {
  return getPasskeyPromptClientAllowList().includes(rpClientId);
}
