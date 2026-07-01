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
    !userHasBeenOnPasswordResetJourney(req) &&
    isPromptableRPClientID(req.session.client.rpClientId) &&
    userIsOnStandard2FaJourney(req) &&
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

function userHasBeenOnPasswordResetJourney(req: Request) {
  return (
    req.session.user?.isPasswordResetJourney ||
    req.session.user?.withinForcedPasswordResetJourney ||
    req.session.user?.isCommonPasswordResetJourney
  );
}

function userIsOnStandard2FaJourney(req: Request) {
  return req.session.user?.isMfaRequired && !req.session.user?.isUpliftRequired;
}
