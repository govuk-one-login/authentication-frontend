import type { Request, Response } from "express";
import {
  getPasskeyPromptClientAllowList,
  getPasskeyRolloutPercentage,
  getPasskeyPromptClientDenyList,
} from "../config.js";

export function shouldPromptToRegisterPasskey(
  req: Request,
  res: Response
): boolean {
  const { user } = req.session;
  const userHasActivePasskeyOrUnknown = user?.hasActivePasskey !== false;

  if (!user?.browserSupportsWebAuthn) return false;
  if (userHasActivePasskeyOrUnknown) return false;
  if (user.hasSkippedPasskeyRegistration) return false;
  if (user.backendIndicatesPasskeyPromptShouldBeSkipped) return false;
  if (user.reauthenticate) return false;
  if (userHasBeenOnPasswordResetJourney(req)) return false;
  if (!isPromptableRPClientID(req.session.client.rpClientId)) return false;
  if (!userHasLoggedInWithPasswordAnd2Fa(req)) return false;
  if (!res.locals.supportPasskeyRegistration) return false;
  if (!user.isInPasskeyPhasedRollout) return false;

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

export function isInPasskeyPhasedRollout(): boolean {
  const passkeyRolloutPercentage = getPasskeyRolloutPercentage();

  if (!passkeyRolloutPercentage) return false;

  const randomPercentage = Math.random() * 100;
  return randomPercentage <= passkeyRolloutPercentage;
}

function isPromptableRPClientID(rpClientId: string) {
  return (
    getPasskeyPromptClientAllowList().includes(rpClientId) &&
    !getPasskeyPromptClientDenyList().includes(rpClientId)
  );
}

function userHasBeenOnPasswordResetJourney(req: Request) {
  return (
    req.session.user?.isPasswordResetJourney ||
    req.session.user?.withinForcedPasswordResetJourney ||
    req.session.user?.isCommonPasswordResetJourney
  );
}

function userHasLoggedInWithPasswordAnd2Fa(req: Request) {
  return req.session.user?.isMfaRequired && !req.session.user?.isUpliftRequired;
}
