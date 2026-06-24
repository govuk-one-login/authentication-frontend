import type { Request, Response } from "express";
import { getPasskeyPromptClientAllowList } from "../config.js";

export function shouldPromptToRegisterPasskey(
  req: Request,
  res: Response
): boolean {
  const { user } = req.session;
  const userHasActivePasskeyOrUnknown = user.hasActivePasskey !== false;

  if (!user?.browserSupportsWebAuthn) return false;
  if (userHasActivePasskeyOrUnknown) return false;
  if (user.hasSkippedPasskeyRegistration) return false;
  if (user.reauthenticate) return false;
  if (user?.backendIndicatesPasskeyPromptShouldBeSkipped) return false;
  if (!isPromptableRPClientID(req.session.client.rpClientId)) return false;
  if (!res.locals.supportPasskeyRegistration) return false;

  return true;
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
